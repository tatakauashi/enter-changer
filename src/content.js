(function () {
  const DEFAULT_SETTINGS = {
    enabled: true,
    sites: {
      chatgpt: true,
      claude: true,
      gemini: true,
    },
  };

  let settings = DEFAULT_SETTINGS;
  const site = resolveSite(window.location.hostname);
  const isMac = navigator.platform.toUpperCase().includes("MAC");

  if (!site) {
    return;
  }

  initialize().catch((error) => {
    console.error("enter-changer の初期化に失敗しました。", error);
  });

  function resolveSite(hostname) {
    const sites = window.EnterChangerSites || [];
    return sites.find((candidate) => candidate.matches(hostname)) || null;
  }

  async function initialize() {
    settings = normalizeSettings(await chrome.storage.local.get(DEFAULT_SETTINGS));

    document.addEventListener("keydown", handleKeydown, true);
    chrome.storage.onChanged.addListener(handleStorageChanged);
  }

  function normalizeSettings(raw) {
    return {
      enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULT_SETTINGS.enabled,
      sites: {
        ...DEFAULT_SETTINGS.sites,
        ...(raw.sites || {}),
      },
    };
  }

  function handleStorageChanged(changes, areaName) {
    if (areaName !== "local") {
      return;
    }

    const nextSettings = {
      enabled: changes.enabled ? changes.enabled.newValue : settings.enabled,
      sites: changes.sites ? { ...settings.sites, ...(changes.sites.newValue || {}) } : settings.sites,
    };

    settings = normalizeSettings(nextSettings);
  }

  function handleKeydown(event) {
    if (event.key !== "Enter") {
      return;
    }

    if (!isEnabledForCurrentSite()) {
      return;
    }

    if (shouldIgnoreForIme(event)) {
      return;
    }

    // 【候補3】resolveTargetInput の所要時間を計測
    const t0 = performance.now();
    const targetInput = resolveTargetInput(event);
    const t1 = performance.now();
    console.log(`[enter-changer][候補3] resolveTargetInput 所要時間: ${(t1 - t0).toFixed(2)}ms`);

    if (!targetInput) {
      return;
    }

    if (isSendShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
      site.send(targetInput);
      return;
    }

    if (event.shiftKey || event.altKey || event.metaKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // 【候補1・2・4】insertNewline 全体の所要時間を計測
    const t2 = performance.now();
    if (typeof site.insertNewline === "function" && site.insertNewline(targetInput)) {
      const t3 = performance.now();
      console.log(`[enter-changer][候補1,2,4] insertNewline 全体所要時間: ${(t3 - t2).toFixed(2)}ms`);
      return;
    }
  }

  function isEnabledForCurrentSite() {
    return settings.enabled && Boolean(settings.sites[site.id]);
  }

  function shouldIgnoreForIme(event) {
    if (event.isComposing) {
      return true;
    }

    if (event.keyCode === 229) {
      return true;
    }

    return false;
  }

  function isSendShortcut(event) {
    if (event.shiftKey || event.altKey) {
      return false;
    }

    if (isMac) {
      return event.metaKey && !event.ctrlKey;
    }

    return event.ctrlKey && !event.metaKey;
  }

  function resolveTargetInput(event) {
    if (typeof site.getTargetInput !== "function") {
      return null;
    }

    const path = typeof event.composedPath === "function" ? event.composedPath() : [];
    // 【候補3】走査するノード数を確認
    console.log(`[enter-changer][候補3] composedPath ノード数: ${path.length}`);
    for (const node of path) {
      const input = site.getTargetInput(node);
      if (input) {
        return input;
      }
    }

    const directTarget = site.getTargetInput(event.target);
    if (directTarget) {
      return directTarget;
    }

    return site.getTargetInput(document.activeElement);
  }
})();
