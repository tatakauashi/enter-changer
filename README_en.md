[日本語 README](./README.md)

# enter-changer

`enter-changer` is a Chrome extension that changes the Enter key behavior in AI chat UIs.

It currently supports **ChatGPT**, **Claude**, and **Gemini**. On supported chat inputs, it provides the following behavior.

- `Enter` inserts a newline
- `Ctrl + Enter` sends on Windows / Linux
- `Command + Enter` sends on macOS
- Global ON / OFF
- Per-site ON / OFF
- Safe handling during Japanese IME composition

## Features

- You can switch global and per-site settings from the popup
- The popup is shown in Japanese or English based on the browser UI language
- Site-specific behavior for ChatGPT / Claude / Gemini is isolated in `src/sites.js`
- Settings are stored in `chrome.storage.local`

## Supported Environment

- Supported sites
  - `https://chatgpt.com/*`
  - `https://chat.openai.com/*`
  - `https://claude.ai/*`
  - `https://gemini.google.com/*`
- Supported browsers
  - Chrome-based browsers
- Implementation
  - Chrome Extension Manifest V3
  - JavaScript
  - `chrome.storage.local`
  - `chrome.i18n`

## Directory Structure

```text
enter-changer/
├─ manifest.json
├─ _locales/
│  ├─ en/
│  │  └─ messages.json
│  └─ ja/
│     └─ messages.json
├─ src/
│  ├─ background.js
│  ├─ content.js
│  ├─ popup.html
│  ├─ popup.js
│  ├─ styles.css
│  └─ sites.js
├─ AGENTS.md
├─ LICENSE
├─ README.md
└─ README_en.md
```

## Setup

1. Open `chrome://extensions/` in Chrome
2. Turn on Developer mode
3. Click "Load unpacked" and select this directory
4. Confirm that `enter-changer` appears in the extensions list

## Popup Usage

1. Open `enter-changer` from the extension icon
2. Use "Enable enter-changer" to turn the feature on or off globally
3. Toggle ChatGPT / Claude / Gemini individually when needed
4. When the global switch is OFF, per-site settings are shown as disabled

## Adding New Messages

Popup strings are managed in `_locales/<locale>/messages.json`. When you add a new string to the existing Japanese and English setup, use this flow.

1. Decide where the new message key will be used in `src/popup.html` or `src/popup.js`
2. For static HTML text, add `data-i18n="messageKey"`
3. For JavaScript text, call `chrome.i18n.getMessage("messageKey")`
4. Add `messageKey` to `_locales/ja/messages.json`
5. Add the same `messageKey` to `_locales/en/messages.json`
6. Reload the extension and verify both Japanese and English UI output

Add entries in `messages.json` with this shape.

```json
{
  "exampleMessage": {
    "message": "Text to display"
  }
}
```

## Adding a New Language

To add a new language such as French, create a new locale directory by copying an existing locale and translating only the message values.

1. Create a new locale directory such as `_locales/fr/`
2. Copy `_locales/en/messages.json` or `_locales/ja/messages.json` to `_locales/fr/messages.json`
3. Keep all keys exactly the same and translate only each `message` value
4. Make sure every key used by the popup also exists in the new locale file
5. Reload the extension and verify the popup under a browser UI using that language

Example:

```text
_locales/
├─ en/
│  └─ messages.json
├─ fr/
│  └─ messages.json
└─ ja/
   └─ messages.json
```

This extension uses `en` as `default_locale` in `manifest.json`, so English is used as the fallback when a locale is missing.

## Manual Checkpoints

- The popup opens correctly
- Popup text changes based on the browser UI language
- Settings persist after reloading
- `Enter` inserts a newline on ChatGPT / Claude / Gemini
- The send shortcut works on ChatGPT / Claude / Gemini
- Enter is not intercepted during IME composition

## Future Ideas

- Grok support
- An options page
- More supported sites
- Diagnostics for future DOM changes
