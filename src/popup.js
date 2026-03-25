const DEFAULT_SETTINGS = {
  enabled: true,
  sites: {
    chatgpt: true,
    claude: true,
    gemini: true,
  },
};

const enabledInput = document.getElementById("enabled");
const chatgptInput = document.getElementById("site-chatgpt");
const claudeInput = document.getElementById("site-claude");
const geminiInput = document.getElementById("site-gemini");
const statusElement = document.getElementById("status");

function normalizeSettings(raw) {
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULT_SETTINGS.enabled,
    sites: {
      ...DEFAULT_SETTINGS.sites,
      ...(raw.sites || {}),
    },
  };
}

function showStatus(message) {
  statusElement.textContent = message;

  window.clearTimeout(showStatus.timerId);
  showStatus.timerId = window.setTimeout(() => {
    statusElement.textContent = "";
  }, 1200);
}

async function loadSettings() {
  const raw = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const settings = normalizeSettings(raw);

  enabledInput.checked = settings.enabled;
  chatgptInput.checked = settings.sites.chatgpt;
  claudeInput.checked = settings.sites.claude;
  geminiInput.checked = settings.sites.gemini;
}

async function saveSettings() {
  const settings = {
    enabled: enabledInput.checked,
    sites: {
      chatgpt: chatgptInput.checked,
      claude: claudeInput.checked,
      gemini: geminiInput.checked,
    },
  };

  await chrome.storage.local.set(settings);
  showStatus("保存しました。");
}

enabledInput.addEventListener("change", () => {
  saveSettings().catch((error) => {
    console.error("設定の保存に失敗しました。", error);
  });
});

chatgptInput.addEventListener("change", () => {
  saveSettings().catch((error) => {
    console.error("設定の保存に失敗しました。", error);
  });
});

claudeInput.addEventListener("change", () => {
  saveSettings().catch((error) => {
    console.error("設定の保存に失敗しました。", error);
  });
});

geminiInput.addEventListener("change", () => {
  saveSettings().catch((error) => {
    console.error("設定の保存に失敗しました。", error);
  });
});

loadSettings().catch((error) => {
  console.error("設定の読込に失敗しました。", error);
  showStatus("設定を読めませんでした。");
});
