[English README](./README_en.md)

# enter-changer

`enter-changer` は、AI チャット画面の Enter キー動作を切り替えるための Chrome 拡張です。

現在は **ChatGPT**、**Claude**、**Gemini** に対応しています。対象サイトの入力欄に対して、次の動作を提供します。

- `Enter` で改行
- Windows / Linux では `Ctrl + Enter` で送信
- Mac では `Command + Enter` で送信
- 機能全体の ON / OFF
- サイト別の ON / OFF
- 日本語 IME 変換中の Enter を妨げない実装

## 特徴

- popup から全体設定とサイト別設定を切り替えられます
- popup はブラウザ言語に応じて日本語 / 英語で表示されます
- ChatGPT / Claude / Gemini ごとの差分は `src/sites.js` に分離しています
- 設定は `chrome.storage.local` に保存されます

## ディレクトリ構成

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

## セットアップ

1. Chrome で `chrome://extensions/` を開きます
2. 「デベロッパー モード」を ON にします
3. 「パッケージ化されていない拡張機能を読み込む」を選び、このディレクトリを指定します
4. 拡張一覧に `enter-changer` が表示されることを確認します

## popup の使い方

1. 拡張アイコンから `enter-changer` を開きます
2. 「機能全体を有効にする」で全体 ON / OFF を切り替えます
3. 必要に応じて ChatGPT / Claude / Gemini のサイト別トグルを切り替えます
4. 全体設定が OFF のときは、サイト別設定は無効表示になります

## 多言語文言の追加方法

popup の文言は `_locales/<言語コード>/messages.json` で管理します。既存の日本語・英語に文言を追加する場合は、次の手順で進めます。

1. `src/popup.html` または `src/popup.js` で新しい文言キーを使う場所を決めます
2. HTML の固定文言なら `data-i18n="messageKey"` を追加します
3. JavaScript から使う文言なら `chrome.i18n.getMessage("messageKey")` を呼びます
4. `_locales/ja/messages.json` に `messageKey` を追加します
5. `_locales/en/messages.json` にも同じ `messageKey` を追加します
6. 拡張を再読み込みして、日本語・英語の両方で表示を確認します

`messages.json` の値は、次の形式で追加します。

```json
{
  "exampleMessage": {
    "message": "表示したい文言"
  }
}
```

## 新しい言語の追加方法

フランス語のような新しい言語を追加する場合は、既存ロケールをコピーして新しい言語コードのフォルダを作ります。

1. `_locales/fr/` のように新しい言語コードのディレクトリを作成します
2. `_locales/en/messages.json` か `_locales/ja/messages.json` を元にして `_locales/fr/messages.json` を作成します
3. すべてのキーを同じ名前でそろえたまま、`message` の値だけを翻訳します
4. popup で使っているすべてのキーが新言語にも存在することを確認します
5. 拡張を再読み込みして、対象言語のブラウザ UI で表示を確認します

例:

```text
_locales/
├─ en/
│  └─ messages.json
├─ fr/
│  └─ messages.json
└─ ja/
   └─ messages.json
```

この拡張では `manifest.json` の `default_locale` が `en` なので、対象言語のロケールが見つからない場合は英語が使われます。

## 動作確認の観点

- popup が開く
- popup の文言がブラウザ言語に応じて切り替わる
- 設定が保存され、再読み込み後も保持される
- ChatGPT / Claude / Gemini で `Enter` が改行として動く
- ChatGPT / Claude / Gemini で送信ショートカットが動く
- IME 変換中の Enter が妨げられない

## 今後の候補

- Grok 対応
- options page の追加
- 対応サイト追加
- DOM 変化時の診断支援
