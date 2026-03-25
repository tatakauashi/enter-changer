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
const siteSettingsSection = document.getElementById("site-settings-section");
const statusElement = document.getElementById("status");

function getMessage(key) {
  return chrome.i18n.getMessage(key) || key;
}

function applyI18n() {
  document.documentElement.lang = chrome.i18n.getUILanguage().startsWith("ja") ? "ja" : "en";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = getMessage(key);
  });
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

function showStatus(messageKey) {
  statusElement.textContent = getMessage(messageKey);

  window.clearTimeout(showStatus.timerId);
  showStatus.timerId = window.setTimeout(() => {
    statusElement.textContent = "";
  }, 1200);
}

function updateSiteSettingsAvailability() {
  const isEnabled = enabledInput.checked;

  chatgptInput.disabled = !isEnabled;
  claudeInput.disabled = !isEnabled;
  geminiInput.disabled = !isEnabled;

  siteSettingsSection.classList.toggle("setting-group--disabled", !isEnabled);
  siteSettingsSection.setAttribute("aria-disabled", String(!isEnabled));
}

async function loadSettings() {
  const raw = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const settings = normalizeSettings(raw);

  enabledInput.checked = settings.enabled;
  chatgptInput.checked = settings.sites.chatgpt;
  claudeInput.checked = settings.sites.claude;
  geminiInput.checked = settings.sites.gemini;

  updateSiteSettingsAvailability();
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
  updateSiteSettingsAvailability();
  showStatus("settingsSaved");
}

function registerInput(input) {
  input.addEventListener("change", () => {
    saveSettings().catch((error) => {
      console.error(getMessage("settingsSaveError"), error);
    });
  });
}

applyI18n();

registerInput(enabledInput);
registerInput(chatgptInput);
registerInput(claudeInput);
registerInput(geminiInput);

loadSettings().catch((error) => {
  console.error(getMessage("settingsLoadError"), error);
  showStatus("settingsLoadFailed");
});