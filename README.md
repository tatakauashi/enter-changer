# enter-changer

`enter-changer` は、AI チャット画面での Enter キー操作を切り替えるための Chrome 拡張です。

現在の初期実装では **ChatGPT** と **Claude** を対象にし、次の動作を提供します。

- `Enter` で改行
- Windows / Linux では `Ctrl + Enter` で送信
- Mac では `Command + Enter` で送信
- 機能全体の ON / OFF
- ChatGPT 向け設定の ON / OFF
- Claude 向け設定の ON / OFF
- 日本語 IME 変換中は介入しない

## 現在確認できていること

手動確認で、次の動作を確認済みです。

- ChatGPT の入力欄で `Enter` で改行できる
- Mac では `Command + Enter` で送信できる
- Windows では `Ctrl + Enter` で送信できる
- popup の「機能全体を有効にする」が動作する
- popup の「ChatGPT で有効にする」が動作する
- 設定が保存され、再読み込み後も反映される

## 現在の対応範囲

- 対応サイト
  - `https://chatgpt.com/*`
  - `https://chat.openai.com/*`
  - `https://claude.ai/*`
- 対応ブラウザ
  - Chrome 系ブラウザ
- 実装方式
  - Chrome Extension Manifest V3
  - JavaScript
  - `chrome.storage.local`

`chat.openai.com` は `chatgpt.com` と同じ扱いで読み込むようにしていますが、初期実装は ChatGPT 系の最小対応を優先しています。

## ディレクトリ構成

```text
enter-changer/
├─ manifest.json
├─ src/
│  ├─ background.js
│  ├─ content.js
│  ├─ popup.html
│  ├─ popup.js
│  ├─ styles.css
│  └─ sites.js
├─ AGENTS.md
├─ LICENSE
└─ README.md
```

## 各ファイルの役割

### `manifest.json`

Manifest V3 の設定です。

- popup
- background service worker
- ChatGPT / Claude 向け content script
- `storage` 権限

### `src/background.js`

初回インストール時に既定設定を補完します。

既定値:

```json
{
  "enabled": true,
  "sites": {
    "chatgpt": true,
    "claude": true
  }
}
```

### `src/popup.html` / `src/popup.js` / `src/styles.css`

拡張アイコンから開く最小設定 UI です。

- 機能全体の ON / OFF
- ChatGPT の ON / OFF
- Claude の ON / OFF
- `chrome.storage.local` への保存

### `src/sites.js`

サイトごとの差分をまとめる場所です。

初期実装では ChatGPT 用と Claude 用のアダプタを持ちます。

- ホスト判定
- 対象入力欄判定
- 送信ボタン探索

### `src/content.js`

ChatGPT / Claude ページ上で動作する本体です。

- 設定の読込
- 対象入力欄の判定
- `keydown` の監視
- IME 変換中の除外
- `Enter` の改行化
- `Ctrl + Enter` / `Command + Enter` の送信

## 動作方針

### IME 安全性

日本語 IME を壊さないことを最優先にしています。

そのため、少なくとも次の場合は Enter の挙動を書き換えません。

- `event.isComposing` が `true`
- `keyCode === 229`

### 入力欄の対象範囲

ページ全体の Enter は横取りせず、ChatGPT / Claude の入力欄と判断できる要素にだけ適用します。

初期実装では、次の条件を組み合わせて判定しています。

- `textarea`
- `contenteditable`
- `role="textbox"`
- composer 周辺要素に属していること

### 送信方法

Windows / Linux では `Ctrl + Enter`、Mac では `Command + Enter` で送信します。
送信時は、まず送信ボタンのクリックを試みます。
強引な synthetic event は増やさず、壊れやすい処理を避ける方針です。

## 使い方

1. Chrome の拡張機能管理画面を開く
2. デベロッパーモードを有効にする
3. 「パッケージ化されていない拡張機能を読み込む」からこのディレクトリを選ぶ
4. ChatGPT または Claude を開く
5. popup で ON / OFF を確認する

## Chrome への適用方法

### 1. 拡張機能として読み込む

1. Chrome で `chrome://extensions/` を開く
2. 画面右上の「デベロッパー モード」を ON にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリックする
4. このリポジトリのディレクトリ `enter-changer` を選ぶ
5. 一覧に `enter-changer` が表示されれば読み込み完了

### 2. popup で設定する

1. Chrome のツールバーにある拡張機能アイコンをクリックする
2. `enter-changer` を開く
3. 次の項目が ON になっていることを確認する

- 機能全体を有効にする
- ChatGPT で有効にする
- Claude で有効にする

### 3. ChatGPT で動作を確認する

1. `https://chatgpt.com/` を開く
2. 入力欄をクリックする
3. `Enter` を押して改行されることを確認する
4. Windows / Linux は `Ctrl + Enter`、Mac は `Command + Enter` を押して送信されることを確認する
5. 日本語 IME 変換中の Enter が通常どおり使えることを確認する

### 4. Claude で動作を確認する

1. `https://claude.ai/` を開く
2. 入力欄をクリックする
3. `Enter` を押して改行されることを確認する
4. Windows / Linux は `Ctrl + Enter`、Mac は `Command + Enter` を押して送信されることを確認する
5. 日本語 IME 変換中の Enter が通常どおり使えることを確認する

### 5. ファイルを更新したあとに反映する

このリポジトリ内のファイルを変更したあと、Chrome 側には自動反映されません。

反映するには次の手順を行います。

1. `chrome://extensions/` を開く
2. `enter-changer` のカードを探す
3. リロードボタンを押す
4. ChatGPT のタブも再読み込みする

### 6. 読み込みに失敗したとき

- `manifest.json` の記述エラーがないか確認する
- `src/` 配下のファイル名が `manifest.json` の参照先と一致しているか確認する
- `chrome://extensions/` の `enter-changer` カード内に出るエラー表示を確認する

## 手動確認項目

### 確認済み

- 拡張の読み込み時に manifest エラーが出ない
- popup が開く
- 設定が保存される
- ChatGPT の入力欄で `Enter` で改行できる
- ChatGPT の入力欄で Windows / Linux は `Ctrl + Enter`、Mac は `Command + Enter` で送信できる
- 機能全体を OFF / ON できる
- ChatGPT を OFF / ON できる

### 引き続き確認したい項目

- 日本語 IME 変換中の Enter が壊れない
- 機能全体を OFF にしたとき、ページの元の挙動に確実に戻る
- ChatGPT を OFF にしたとき、ページの元の挙動に確実に戻る
- Claude の入力欄で `Enter` で改行できる
- Claude の入力欄で Windows / Linux は `Ctrl + Enter`、Mac は `Command + Enter` で送信できる
- Claude を OFF / ON できる
- ChatGPT / Claude 側の DOM 変更後も入力欄判定と送信ボタン判定が維持できる

## 今後の予定

次の段階で、必要に応じて対応サイトを追加します。

- Gemini
- Grok

ただし、まずは ChatGPT / Claude 対応を安定させることを優先します。
