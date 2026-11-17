// CommonJS entry point works in this buildless Vercel project without a package.json.
module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Méthode non autorisée.' });
  }
  const origin = request.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.host) {
        return response.status(403).json({ error: 'Origine non autorisée.' });
      }
    } catch {
      return response.status(403).json({ error: 'Origine non autorisée.' });
    }
  }
  if (!request.headers['content-type']?.startsWith('application/json')) {
    return response.status(415).json({ error: 'Format attendu : JSON.' });
  }
  if (Number(request.headers['content-length'] || 0) > 100000) {
    return response.status(413).json({ error: 'Retour trop long.' });
  }
  let input;
  try {
    input = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  } catch {
    return response.status(400).json({ error: 'Requête invalide.' });
  }

  const {
    sourcePassages, extractSummary, feedbackValidationError,
    feedbackInstructions, feedbackSchema, parseFeedbackSelection
  } = await import('../../lib/retours-formateur.mjs');
  const { day, text } = input || {};
  const validation = feedbackValidationError(day, text);
  if (validation) return response.status(validation.status).json({ error: validation.error });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      error: 'La synthèse en ligne attend la configuration de GROQ_API_KEY dans Vercel.'
    });
  }
  const passages = sourcePassages(text);
  try {
    const completion = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: feedbackInstructions(day) },
          {
            role: 'user',
            content: JSON.stringify(passages.map((passage, index) => ({ numero: index + 1, passage })))
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'retour_formateur', strict: false, schema: feedbackSchema(passages.length) }
        },
        reasoning_effort: 'low',
        max_completion_tokens: 1000
      })
    });
    if (completion.status === 429) {
      return response.status(429).json({ error: 'Quota de synthèse atteint. Réessayez plus tard.' });
    }
    if (completion.status === 401 || completion.status === 403) {
      return response.status(503).json({ error: 'La configuration Groq doit être vérifiée dans Vercel.' });
    }
    if (!completion.ok) throw new Error('Groq indisponible');
    const data = await completion.json();
    const selection = parseFeedbackSelection(data.choices?.[0]?.message?.content || '{}', passages);
    const summary = extractSummary(day, passages, selection);
    if (!summary) {
      return response.status(422).json({
        error: 'Aucun passage exploitable. Ajoutez des faits concrets sur la formation.'
      });
    }
    return response.status(200).json({ summary });
  } catch {
    return response.status(503).json({
      error: 'Synthèse indisponible. Vous pouvez enregistrer un brouillon ou envoyer votre texte.'
    });
  }
};
