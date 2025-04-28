export default class HtmlBuilder {
  constructor(document) {
    this.document = document || globalThis.document;
  }

  createElement(tag, className, textContent) {
    const element = this.document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }

  createButton(className, textContent) {
    const button = this.createElement('button', className, textContent);
    button.type = 'button';
    return button;
  }

  createDiv(className, textContent) {
    return this.createElement('div', className, textContent);
  }
}