"use strict";

function buildOpenNextChatNeedingAttentionScript({
  seenFingerprints = {},
  activeChatTitle = null,
  cooldownPreview = null
} = {}) {
  return `(() => {
    const seenFingerprints = ${JSON.stringify(seenFingerprints || {})};
    const activeChatTitle = ${JSON.stringify(activeChatTitle || null)};
    const cooldownPreview = ${JSON.stringify(cooldownPreview || null)};

    const rows = [...document.querySelectorAll('[role="row"]')];
    const candidates = [];
    rows.forEach((row, position) => {
      const text = (row.innerText || '').replace(/\\s+/g, ' ').trim();
      if (!text) return;
      const looksLikeChat = /上午|下午|AM|PM|\\d{1,2}:\\d{2}/i.test(text);
      if (!looksLikeChat) return;

      const ariaParts = [row.getAttribute('aria-label') || ''];
      [...row.querySelectorAll('[aria-label]')].forEach((el) => ariaParts.push(el.getAttribute('aria-label') || ''));
      const aria = ariaParts.join(' ');

      const titleMatch = text.match(/^(?:\\d+\\s*個未讀訊息\\s*)?(.{1,40}?)\\s+(?:上午|下午|AM|PM|\\d{1,2}:\\d{2})/);
      const chatKey = titleMatch ? titleMatch[1].trim() : text.slice(0, 30);

      const hasUnreadBadge = /未讀|未读|unread/i.test(text + ' ' + aria);
      const latestIsOutgoing = /(^|\\s)你：|^You:/.test(aria);
      const fingerprint = text.slice(0, 200);
      const previewSnippet = text.slice(0, 140);

      candidates.push({ position, chatKey, fingerprint, previewSnippet, hasUnreadBadge, latestIsOutgoing });
    });

    const snapshot = {};
    for (const c of candidates) snapshot[c.chatKey] = c.fingerprint;

    // WhatsApp Web orders the sidebar by latest activity (newest at top, position 0).
    // We process the chat whose latest message has been waiting longest, so iterate from
    // the bottom of the list back to the top and pick the first match we find.
    const reversed = candidates.slice().reverse();
    let target = reversed.find((c) => c.hasUnreadBadge && c.chatKey !== activeChatTitle);
    let reason = target ? 'unread_badge' : null;
    if (!target) {
      target = reversed.find((c) =>
        !c.latestIsOutgoing &&
        c.chatKey !== activeChatTitle &&
        Object.prototype.hasOwnProperty.call(seenFingerprints, c.chatKey) &&
        seenFingerprints[c.chatKey] !== c.fingerprint
      );
      if (target) reason = 'row_changed';
    }

    if (!target) return JSON.stringify({ opened: false, snapshot });

    if (cooldownPreview && target.previewSnippet === cooldownPreview) {
      return JSON.stringify({ opened: false, skipped: true, preview: target.previewSnippet, snapshot });
    }

    const row = rows[target.position];
    row.scrollIntoView({ block: 'center' });
    const rect = row.getBoundingClientRect();
    const x = rect.left + Math.min(rect.width - 8, Math.max(8, rect.width / 2));
    const y = rect.top + Math.min(rect.height - 8, Math.max(8, rect.height / 2));
    const elementToClick = document.elementFromPoint(x, y) || row;
    for (const type of ['mouseover', 'mousemove', 'mousedown', 'mouseup', 'click']) {
      elementToClick.dispatchEvent(new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 0
      }));
    }
    return JSON.stringify({ opened: true, chatKey: target.chatKey, preview: target.previewSnippet, reason, snapshot });
  })()`;
}

function buildReadSidebarSnapshotScript() {
  return `(() => {
    const rows = [...document.querySelectorAll('[role="row"]')];
    const snapshot = {};
    rows.forEach((row) => {
      const text = (row.innerText || '').replace(/\\s+/g, ' ').trim();
      if (!text) return;
      const looksLikeChat = /上午|下午|AM|PM|\\d{1,2}:\\d{2}/i.test(text);
      if (!looksLikeChat) return;
      const titleMatch = text.match(/^(?:\\d+\\s*個未讀訊息\\s*)?(.{1,40}?)\\s+(?:上午|下午|AM|PM|\\d{1,2}:\\d{2})/);
      const chatKey = titleMatch ? titleMatch[1].trim() : text.slice(0, 30);
      snapshot[chatKey] = text.slice(0, 200);
    });
    return JSON.stringify({ snapshot });
  })()`;
}

module.exports = {
  buildOpenNextChatNeedingAttentionScript,
  buildReadSidebarSnapshotScript
};
