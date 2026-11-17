const segmenter = new Intl.Segmenter('fr', { granularity: 'sentence' });
const sectionKeys = ['deroule', 'reussites', 'difficultes', 'suite'];

export function feedbackSections(day) {
  return [
    'Déroulé et participation',
    'Ce qui a bien fonctionné',
    'Difficultés et points de vigilance',
    day === 1
      ? 'Ajustements proposés pour J2'
      : 'Points à reprendre dans le bilan de formation',
  ];
}

export function sourcePassages(text) {
  return text.trim().split(/\r?\n/).flatMap(line =>
    Array.from(segmenter.segment(line), ({ segment }) =>
      segment.trim().replace(/^[-•]\s+/, ''),
    ).filter(Boolean),
  );
}

export function extractSummary(day, passages, selection) {
  const used = new Set();

  const sections = feedbackSections(day).map((title, section) => {
    const indices = selection?.[sectionKeys[section]];
    const bullets = [];

    for (const index of Array.isArray(indices) ? indices : []) {
      if (!Number.isInteger(index) || index < 1 || index > passages.length) {
        continue;
      }
      if (used.has(index)) continue;

      const passage = passages[index - 1];
      // Garder le passage entier préserve les négations et les nuances.
      if (passage.length > 480) continue;

      used.add(index);
      bullets.push(`• ${passage}`);

      if (bullets.length === 2) break;
    }

    return `### ${title}\n${bullets.join('\n') || 'Non abordé'}`;
  });

  return used.size ? sections.join('\n\n') : '';
}