/**
 * Live Stats for Presentations — Figma plugin main code.
 * Listens for stats from the UI (WebSocket), finds text layers named "stats:*"
 * and updates their characters.
 */

function isStatsLayer(name) {
  if (typeof name !== 'string') return false;
  return name.trim().toLowerCase().startsWith('stats:');
}

function getStatsKey(name) {
  if (!isStatsLayer(name)) return null;
  const key = name.split(':')[1];
  return key ? key.trim().toLowerCase() : null;
}

async function loadFontsForNode(node) {
  if (node.type !== 'TEXT') return;
  const textNode = node;
  const len = textNode.characters.length;
  if (len > 0) {
    const font = textNode.getRangeAllFontNames(0, len);
    for (const f of font) {
      await figma.loadFontAsync({ family: f.family, style: f.style });
    }
  } else if (textNode.fontName !== figma.mixed) {
    await figma.loadFontAsync(textNode.fontName);
  }
}

function formatOptionText(payload, optionId, count, total) {
  const label = (payload.optionLabels && payload.optionLabels[optionId]) || optionId;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return `${label}: ${count} (${pct}%)`;
}

function applyPayloadToLayers(payload) {
  const total = payload.total != null ? payload.total : 0;
  const counts = payload.counts || {};
  const optionIds = payload.optionIds || Object.keys(counts);

  return figma.loadAllPagesAsync().then(function () {
    const root = figma.root;
    const textNodes = [];
    root.findAll(function (n) {
      if (n.type === 'TEXT' && isStatsLayer(n.name)) {
        textNodes.push(n);
      }
      return false;
    });

    const promises = textNodes.map(async function (node) {
      const key = getStatsKey(node.name);
      if (!key) return;

      let text = '';
      if (key === 'total') {
        text = String(total);
      } else if (key === 'question') {
        text = payload.question != null ? String(payload.question) : '';
      } else {
        const index = typeof key === 'string' && /^\d+$/.test(key) ? parseInt(key, 10) : -1;
        const optionId = index >= 0 && optionIds[index] != null ? optionIds[index] : key;
        const count = counts[optionId] != null ? counts[optionId] : counts[key];
        if (count != null) {
          text = formatOptionText(payload, optionId, count, total);
        }
      }

      await loadFontsForNode(node);
      node.characters = text;
    });

    return Promise.all(promises);
  });
}

figma.showUI(__html__, { width: 360, height: 220 });

figma.ui.onmessage = function (msg) {
  if (msg.type === 'stats' && msg.payload) {
    applyPayloadToLayers(msg.payload).catch(function (err) {
      console.error('Live Stats: failed to apply payload', err);
      figma.notify('Ошибка обновления слоёв: ' + (err.message || String(err)));
    }).then(function () {
      figma.notify('Статистика обновлена');
    });
  }
};
