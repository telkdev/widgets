class EnvironmentDetector {
  #document = null;
  #window = null;
  #isNode = typeof window === 'undefined';

  constructor() {
    this.#setupEnvironment();
  }

  #setupEnvironment() {
    if (!this.#isNode) {
      this.#tryLoadWindow();
    } else {
      this.#tryLoadJSDOM();
    }
  }

  #tryLoadWindow() {
    try {
      this.#document = document;
      this.#window = window;
    } catch (e) {
      throw new Error(
        'Please run this code in a browser context or in Node.js with JSDOM.'
      );
    }
  }

  #tryLoadJSDOM() {
    try {
      const HTML = '<!DOCTYPE html><html><body></body></html>'
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM(HTML);
      this.#document = dom.window.document;
      this.#window = dom.window;
    } catch (e) {
      throw new Error(
        'Widget system requires JSDOM in Node.js environment. Please install JSDOM: npm install jsdom'
      );
    }
  }

  get document() {
    return this.#document;
  }

  get window() {
    return this.#window;
  }

  get isNode() {
    return this.#isNode;
  }
}

export const env = new EnvironmentDetector();