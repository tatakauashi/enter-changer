const DEFAULT_SETTINGS = {
  enabled: true,
  sites: {
    chatgpt: true,
    claude: true,
    gemini: true,
  },
};

async function ensureSettings() {
  const current = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const next = {
    enabled: typeof current.enabled === "boolean" ? current.enabled : DEFAULT_SETTINGS.enabled,
    sites: {
      ...DEFAULT_SETTINGS.sites,
      ...(current.sites || {}),
    },
  };

  await chrome.storage.local.set(next);
}

chrome.runtime.onInstalled.addListener(() => {
  ensureSettings().catch((error) => {
    console.error("設定の初期化に失敗しました。", error);
  });
});
