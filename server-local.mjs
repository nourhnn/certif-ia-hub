import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  sourcePassages, extractSummary, feedbackValidationError,
  feedbackInstructions, feedbackSchema, parseFeedbackSelection
} from './lib/retours-formateur.mjs';

const root = new URL('./', import.meta.url);
const port = Number(process.env.HUB_PORT || 8787);
const endpoint = '/api/retours-formateur/synthese';
const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf'
};

function json(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

async function summarize(request, response) {
  if (request.method !== 'POST') return json(response, 405, { error: 'Méthode non autorisée.' });
  const origin = request.headers.origin;
  const localOrigins = [`http://127.0.0.1:${port}`, `http://localhost:${port}`];
  if (origin && !localOrigins.includes(origin)) return json(response, 403, { error: 'Origine non autorisée.' });
  if (!request.headers['content-type']?.startsWith('application/json')) {
    return json(response, 415, { error: 'Format attendu : JSON.' });
  }
  let input;
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of request.iterator({ destroyOnReturn: false })) {
      size += chunk.length;
      if (size > 100000) return json(response, 413, { error: 'Retour trop long.' });
      chunks.push(chunk);
    }
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return json(response, 400, { error: 'Requête invalide.' });
  }
  const { day, text } = input || {};
  const validation = feedbackValidationError(day, text);
  if (validation) return json(response, validation.status, { error: validation.error });
  const passages = sourcePassages(text);
  try {
    const completion = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:3b',
        stream: false,
        messages: [
          { role: 'system', content: feedbackInstructions(day) },
          { role: 'user', content: JSON.stringify(passages.map((passage, index) => ({ numero: index + 1, passage }))) }
        ],
        format: feedbackSchema(passages.length),
        options: { temperature: 0, num_predict: 160, num_ctx: 8192 }
      }),
      signal: AbortSignal.timeout(110000)
    });
    if (!completion.ok) throw new Error('Ollama indisponible');
    const data = await completion.json();
    const selection = parseFeedbackSelection(data.message?.content || '{}', passages);
    const summary = extractSummary(day, passages, selection);
    if (!summary) return json(response, 422, { error: 'Aucun passage exploitable. Ajoutez des faits concrets sur la formation.' });
    json(response, 200, { summary });
  } catch {
    json(response, 503, { error: 'Ouvrez Ollama et vérifiez que qwen2.5:3b est disponible.' });
  }
}

createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (path === endpoint) return await summarize(request, response);
    const filename = path === '/' ? 'index.html' : path.slice(1);
    const type = mime[extname(filename)];
    if (request.method !== 'GET' || !type || !/^(?:assets\/[\w/-]+\.[\w]+|[\w-]+\.[\w]+)$/.test(filename)) {
      return json(response, 404, { error: 'Page introuvable.' });
    }
    const file = await readFile(fileURLToPath(new URL(filename, root)));
    response.writeHead(200, { 'Content-Type': type.startsWith('text/') ? type + '; charset=utf-8' : type });
    response.end(file);
  } catch {
    if (!response.headersSent) json(response, 404, { error: 'Page introuvable.' });
    else response.end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Hub local : http://127.0.0.1:${port}`);
});
