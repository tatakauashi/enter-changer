(function () {
  function isEditableElement(element) {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    if (element instanceof HTMLTextAreaElement) {
      return true;
    }

    if (element.isContentEditable) {
      return true;
    }

    if (element.getAttribute("role") === "textbox") {
      return true;
    }

    return false;
  }

  function isWithinComposer(element) {
    return Boolean(
      element.closest("form") ||
        element.closest("[data-testid='composer']") ||
        element.closest("[data-testid='conversation-turn-input']") ||
        element.closest("[class*='composer']")
    );
  }

  function isWithinClaudeComposer(element) {
    return Boolean(
      element.closest("fieldset") ||
        element.closest("form") ||
        element.closest("[data-testid='chat-input']") ||
        element.closest("[class*='ProseMirror']")
    );
  }

  function isWithinGeminiComposer(element) {
    return Boolean(
      element.closest("form") ||
        element.closest("message-input") ||
        element.closest("rich-textarea") ||
        element.closest("[class*='input-area']") ||
        element.closest("[class*='ql-editor']")
    );
  }

  function toHTMLElement(node) {
    if (node instanceof HTMLElement) {
      return node;
    }

    if (node instanceof Node) {
      return node.parentElement;
    }

    return null;
  }

  function findEditableRoot(node) {
    const element = toHTMLElement(node);
    if (!element) {
      return null;
    }

    if (isEditableElement(element)) {
      return element;
    }

    return element.closest("textarea, [contenteditable='true'], [role='textbox']");
  }

  function findSendButton(input) {
    const root = input.closest("form") || document;
    const selectors = [
      "button[data-testid='send-button']",
      "button[aria-label*='Send']",
      "button[aria-label*='送信']",
      "button[data-testid='fruitjuice-send-button']",
      "button[type='submit']",
    ];

    for (const selector of selectors) {
      const button = root.querySelector(selector);

      if (button instanceof HTMLButtonElement && !button.disabled) {
        return button;
      }
    }

    return null;
  }

  function findClaudeSendButton(input) {
    const root = input.closest("form") || input.closest("fieldset") || document;
    const selectors = [
      "button[aria-label*='Send']",
      "button[aria-label*='送信']",
      "button[data-testid='send-button']",
      "button[type='submit']",
    ];

    for (const selector of selectors) {
      const button = root.querySelector(selector);
      if (button instanceof HTMLButtonElement && !button.disabled) {
        return button;
      }
    }

    return null;
  }

  function findGeminiSendButton(input) {
    const root = input.closest("form") || input.closest("message-input") || document;
    const selectors = [
      "button[aria-label*='Send']",
      "button[aria-label*='送信']",
      "button[mattooltip*='Send']",
      "button[data-test-id='send-button']",
      "button[type='submit']",
    ];

    for (const selector of selectors) {
      const button = root.querySelector(selector);
      if (button instanceof HTMLButtonElement && !button.disabled) {
        return button;
      }
    }

    return null;
  }

  function dispatchInputEvent(target, inputType) {
    target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType, data: null }));
  }

  function insertChatGptNewline(target) {
    if (target instanceof HTMLTextAreaElement) {
      const keyboardEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });

      return target.dispatchEvent(keyboardEvent);
    }

    if (!(target instanceof HTMLElement) || !target.isContentEditable) {
      return false;
    }

    target.focus({ preventScroll: true });

    const keydownEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    const keyupEvent = new KeyboardEvent("keyup", {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    const keydownAccepted = target.dispatchEvent(keydownEvent);
    target.dispatchEvent(keyupEvent);

    if (!keydownAccepted) {
      return true;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    if (!target.contains(range.startContainer) || !target.contains(range.endContainer)) {
      return false;
    }

    if (document.execCommand("insertParagraph", false)) {
      dispatchInputEvent(target, "insertParagraph");
      return true;
    }

    if (document.execCommand("insertLineBreak", false)) {
      dispatchInputEvent(target, "insertLineBreak");
      return true;
    }

    if (document.execCommand("insertHTML", false, "<br>")) {
      dispatchInputEvent(target, "insertLineBreak");
      return true;
    }

    return false;
  }

  function insertClaudeNewline(target) {
    if (target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;

      target.value = `${value.slice(0, start)}\n${value.slice(end)}`;
      target.selectionStart = start + 1;
      target.selectionEnd = start + 1;
      dispatchInputEvent(target, "insertLineBreak");
      return true;
    }

    if (!(target instanceof HTMLElement) || !target.isContentEditable) {
      return false;
    }

    target.focus({ preventScroll: true });

    const keydownEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    const keyupEvent = new KeyboardEvent("keyup", {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    const keydownAccepted = target.dispatchEvent(keydownEvent);
    target.dispatchEvent(keyupEvent);

    if (!keydownAccepted) {
      return true;
    }

    if (document.execCommand("insertLineBreak", false)) {
      dispatchInputEvent(target, "insertLineBreak");
      return true;
    }

    if (document.execCommand("insertHTML", false, "<br>")) {
      dispatchInputEvent(target, "insertLineBreak");
      return true;
    }

    return false;
  }

  function insertGeminiNewline(target) {
    if (target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;

      target.value = `${value.slice(0, start)}\n${value.slice(end)}`;
      target.selectionStart = start + 1;
      target.selectionEnd = start + 1;
      dispatchInputEvent(target, "insertLineBreak");
      return true;
    }

    if (!(target instanceof HTMLElement) || !target.isContentEditable) {
      return false;
    }

    target.focus({ preventScroll: true });

    const keydownEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    const keyupEvent = new KeyboardEvent("keyup", {
      key: "Enter",
      code: "Enter",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    const keydownAccepted = target.dispatchEvent(keydownEvent);
    target.dispatchEvent(keyupEvent);

    if (!keydownAccepted) {
      return true;
    }

    if (document.execCommand("insertLineBreak", false)) {
      dispatchInputEvent(target, "insertLineBreak");
      return true;
    }

    if (document.execCommand("insertHTML", false, "<br>")) {
      dispatchInputEvent(target, "insertLineBreak");
      return true;
    }

    return false;
  }

  const chatgptSite = {
    id: "chatgpt",
    matches(hostname) {
      return hostname === "chatgpt.com" || hostname === "chat.openai.com";
    },
    getTargetInput(element) {
      const input = findEditableRoot(element);

      if (!input) {
        return null;
      }

      return this.isTargetInput(input) ? input : null;
    },
    isTargetInput(element) {
      return isEditableElement(element) && isWithinComposer(element);
    },
    send(input) {
      const button = findSendButton(input);

      if (!button) {
        return false;
      }

      button.click();
      return true;
    },
    insertNewline(input) {
      return insertChatGptNewline(input);
    },
  };

  const claudeSite = {
    id: "claude",
    matches(hostname) {
      return hostname === "claude.ai";
    },
    getTargetInput(element) {
      const input = findEditableRoot(element);

      if (!input) {
        return null;
      }

      return this.isTargetInput(input) ? input : null;
    },
    isTargetInput(element) {
      return isEditableElement(element) && isWithinClaudeComposer(element);
    },
    send(input) {
      const button = findClaudeSendButton(input);

      if (!button) {
        return false;
      }

      button.click();
      return true;
    },
    insertNewline(input) {
      return insertClaudeNewline(input);
    },
  };

  const geminiSite = {
    id: "gemini",
    matches(hostname) {
      return hostname === "gemini.google.com";
    },
    getTargetInput(element) {
      const input = findEditableRoot(element);

      if (!input) {
        return null;
      }

      return this.isTargetInput(input) ? input : null;
    },
    isTargetInput(element) {
      return isEditableElement(element) && isWithinGeminiComposer(element);
    },
    send(input) {
      const button = findGeminiSendButton(input);

      if (!button) {
        return false;
      }

      button.click();
      return true;
    },
    insertNewline(input) {
      return insertGeminiNewline(input);
    },
  };

  window.EnterChangerSites = [chatgptSite, claudeSite, geminiSite];
})();
