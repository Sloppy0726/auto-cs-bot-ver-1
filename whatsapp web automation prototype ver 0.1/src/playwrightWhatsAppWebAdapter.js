"use strict";

const path = require("node:path");

function createPlaywrightWhatsAppWebAdapter(options = {}) {
  const config = {
    profileDir: options.profileDir || path.join(process.cwd(), ".local", "whatsapp-web-profile"),
    headless: options.headless === true,
    slowMo: Number(options.slowMo || 50),
    logger: options.logger || console
  };

  const state = {
    context: null,
    page: null
  };

  return {
    async start() {
      if (state.page) return state.page;

      const { chromium } = loadPlaywright();
      state.context = await chromium.launchPersistentContext(config.profileDir, {
        headless: config.headless,
        slowMo: config.slowMo,
        viewport: null
      });

      state.page = state.context.pages()[0] || await state.context.newPage();
      await state.page.goto("https://web.whatsapp.com/", { waitUntil: "domcontentloaded" });
      config.logger.log?.("[wa-web] Browser opened. Scan QR if needed, then open one test chat manually.");
      return state.page;
    },

    async readLatestIncomingMessage() {
      const page = await ensurePage(state);
      return page.evaluate(() => {
        function readChatTitle() {
          const titleNode = document.querySelector('header span[title], header [data-testid="conversation-info-header-chat-title"]');
          const title = titleNode?.getAttribute("title") || titleNode?.textContent || "";
          return title.trim();
        }

        function readMessageText(node) {
          const textNodes = Array.from(node.querySelectorAll("span.selectable-text.copyable-text, span.copyable-text"));
          const text = textNodes
            .map((item) => item.textContent || "")
            .join("\n")
            .replace(/\u200e/g, "")
            .trim();

          if (text) return text;

          const fallback = Array.from(node.querySelectorAll("span[dir='ltr'], span[dir='auto']"))
            .map((item) => item.textContent || "")
            .join("\n")
            .replace(/\u200e/g, "")
            .trim();

          return fallback;
        }

        function readTimestamp(node) {
          const copyable = node.querySelector("[data-pre-plain-text]")?.getAttribute("data-pre-plain-text");
          if (copyable) return copyable;
          const aria = node.querySelector("[aria-label]")?.getAttribute("aria-label");
          return aria || "";
        }

        const chatTitle = readChatTitle();
        const inboundMessages = Array.from(document.querySelectorAll('div.message-in, div[class*="message-in"]'))
          .map((node, index) => {
            const text = readMessageText(node);
            if (!text) return null;
            const timestamp = readTimestamp(node);
            return {
              id: node.getAttribute("data-id") || null,
              chatTitle,
              senderId: chatTitle || "whatsapp_web_sender",
              text,
              timestamp,
              position: index
            };
          })
          .filter(Boolean);

        return inboundMessages[inboundMessages.length - 1] || null;
      });
    },

    async debugSnapshot() {
      const page = await ensurePage(state);
      return page.evaluate(() => {
        const titleNode = document.querySelector('header span[title], header [data-testid="conversation-info-header-chat-title"]');
        const chatTitle = (titleNode?.getAttribute("title") || titleNode?.textContent || "").trim();
        const inboundCount = document.querySelectorAll('div.message-in, div[class*="message-in"]').length;
        const outboundCount = document.querySelectorAll('div.message-out, div[class*="message-out"]').length;
        const selectableCount = document.querySelectorAll("span.selectable-text.copyable-text, span.copyable-text").length;
        const copyableDataCount = document.querySelectorAll("[data-pre-plain-text]").length;
        const bodyText = document.body?.innerText?.replace(/\s+/g, " ").trim().slice(0, 300) || "";
        return { chatTitle, inboundCount, outboundCount, selectableCount, copyableDataCount, bodyText };
      });
    },

    async listVisibleChats(options = {}) {
      const page = await ensurePage(state);
      const limit = Number(options.limit || 20);
      return page.evaluate((maxItems) => {
        const pane = document.querySelector("#pane-side") || document.body;
        const seen = new Set();
        const chats = [];

        function closestRow(node) {
          return node.closest('[role="listitem"], [role="row"], div[tabindex="-1"], div[tabindex="0"]') || node.closest("div");
        }

        function hasUnread(row) {
          if (!row) return false;
          const unreadSelector = [
            '[aria-label*="unread" i]',
            '[data-icon*="unread" i]',
            '[data-testid*="unread" i]',
            '[aria-label*="未讀"]',
            '[aria-label*="未读"]'
          ].join(",");
          return Boolean(row.querySelector(unreadSelector));
        }

        for (const node of Array.from(pane.querySelectorAll("span[title]"))) {
          const title = (node.getAttribute("title") || node.textContent || "").trim();
          if (!title || seen.has(title)) continue;
          const row = closestRow(node);
          seen.add(title);
          chats.push({
            title,
            unread: hasUnread(row),
            preview: (row?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 160)
          });
          if (chats.length >= maxItems) break;
        }

        return chats;
      }, limit);
    },

    async openChat(chatTitle) {
      const page = await ensurePage(state);
      const title = String(chatTitle || "").trim();
      const opened = await clickChatTitleWithLocator(page, title)
        || await clickVisibleChatTitle(page, title)
        || await searchAndOpenChat(page, title);

      if (!opened) throw new Error(`chat_not_visible:${chatTitle}`);
      await page.waitForTimeout(500);
      return true;
    },

    async sendText(text) {
      const page = await ensurePage(state);
      const composer = page.locator('footer div[contenteditable="true"][role="textbox"], footer div[contenteditable="true"]').last();
      await composer.waitFor({ state: "visible", timeout: 10_000 });
      await composer.click();
      await page.keyboard.insertText(String(text));
      await page.keyboard.press("Enter");
    },

    async stop() {
      await state.context?.close();
      state.context = null;
      state.page = null;
    },

    _state: state
  };
}

async function ensurePage(state) {
  if (!state.page) throw new Error("whatsapp_web_not_started");
  return state.page;
}

async function clickChatTitleWithLocator(page, chatTitle) {
  if (!chatTitle) return false;
  try {
    const exactText = page.locator("#pane-side").getByText(chatTitle, { exact: true }).first();
    await exactText.waitFor({ state: "visible", timeout: 2_000 });
    await exactText.click();
    await page.waitForTimeout(700);
    return isCurrentChat(page, chatTitle);
  } catch (_) {
    return false;
  }
}

async function isCurrentChat(page, chatTitle) {
  return page.evaluate((targetTitle) => {
    const titleNode = document.querySelector('header span[title], header [data-testid="conversation-info-header-chat-title"]');
    const title = (titleNode?.getAttribute("title") || titleNode?.textContent || "").trim();
    return title === targetTitle || title.includes(targetTitle);
  }, chatTitle);
}

async function clickVisibleChatTitle(page, chatTitle) {
  return page.evaluate((targetTitle) => {
    const pane = document.querySelector("#pane-side") || document.body;
    const titleNodes = Array.from(pane.querySelectorAll("span[title]"));
    const targetByTitle = titleNodes.find((node) => {
      const title = (node.getAttribute("title") || node.textContent || "").trim();
      return title === targetTitle;
    });
    const rows = Array.from(pane.querySelectorAll('[role="listitem"], [role="row"], div[tabindex="-1"], div[tabindex="0"]'));
    const targetByText = rows.find((row) => (row.textContent || "").trim().includes(targetTitle));
    const target = targetByTitle || targetByText;
    if (!target) return false;
    const row = target.closest?.('[role="listitem"], [role="row"], div[tabindex="-1"], div[tabindex="0"]') || target;
    row.click();
    return true;
  }, chatTitle);
}

async function searchAndOpenChat(page, chatTitle) {
  const searchBox = page.locator('#side div[contenteditable="true"][role="textbox"], #side div[contenteditable="true"]').first();
  try {
    await searchBox.waitFor({ state: "visible", timeout: 5_000 });
    await searchBox.click();
    await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await page.keyboard.press("Backspace");
    await page.keyboard.insertText(chatTitle);
    await page.waitForTimeout(1_000);
    const opened = await clickChatTitleWithLocator(page, chatTitle) || await clickVisibleChatTitle(page, chatTitle);
    if (!opened) await page.keyboard.press("Escape");
    return opened;
  } catch (_) {
    return false;
  }
}

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    const bundledNodeModules = "/Users/book/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
    module.paths.push(bundledNodeModules);
    try {
      return require("playwright");
    } catch (_) {
      throw error;
    }
  }
}

function readLatestIncomingMessageFromDom() {
  const chatTitle = readChatTitle();
  const inboundMessages = Array.from(document.querySelectorAll('div.message-in, div[class*="message-in"]'))
    .map((node, index) => {
      const text = readMessageText(node);
      if (!text) return null;
      return {
        id: node.getAttribute("data-id") || `${chatTitle || "chat"}:${index}:${text.slice(0, 80)}`,
        chatTitle,
        senderId: chatTitle || "whatsapp_web_sender",
        text,
        timestamp: readTimestamp(node)
      };
    })
    .filter(Boolean);

  return inboundMessages[inboundMessages.length - 1] || null;
}

function readChatTitle() {
  const titleNode = document.querySelector('header span[title], header [data-testid="conversation-info-header-chat-title"]');
  const title = titleNode?.getAttribute("title") || titleNode?.textContent || "";
  return title.trim();
}

function readMessageText(node) {
  const textNodes = Array.from(node.querySelectorAll("span.selectable-text.copyable-text, span.copyable-text"));
  const text = textNodes
    .map((item) => item.textContent || "")
    .join("\n")
    .replace(/\u200e/g, "")
    .trim();

  if (text) return text;

  const fallback = Array.from(node.querySelectorAll("span[dir='ltr'], span[dir='auto']"))
    .map((item) => item.textContent || "")
    .join("\n")
    .replace(/\u200e/g, "")
    .trim();

  return fallback;
}

function readTimestamp(node) {
  const copyable = node.querySelector("[data-pre-plain-text]")?.getAttribute("data-pre-plain-text");
  if (copyable) return copyable;
  const aria = node.querySelector("[aria-label]")?.getAttribute("aria-label");
  return aria || "";
}

module.exports = {
  createPlaywrightWhatsAppWebAdapter,
  _internal: {
    readLatestIncomingMessageFromDom,
    readChatTitle,
    readMessageText,
    readTimestamp
  }
};
