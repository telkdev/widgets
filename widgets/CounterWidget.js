import { BaseWidget } from '../BaseWidget.js';
import HtmlBuilder from '../utils/HtmlBuilder.js';

class CounterWidget extends BaseWidget {
  constructor(node) {
    super(node);
    this.clickCount = 0;
    this.HTMLBuilder = new HtmlBuilder(this.document);
  }

  async initContent() {
    this.widgetContent = this.HTMLBuilder.createDiv('widget-content');

    this.clickDisplay = this.HTMLBuilder.createDiv('widget-counter');
    this.clickDisplay.textContent = 'Click count: 0';
    this.widgetContent.appendChild(this.clickDisplay);

    this.resetButton = this.HTMLBuilder.createButton('widget-button', 'Reset Count');
    this.resetButton.addEventListener('click', this.resetClickHandler);
    this.widgetContent.appendChild(this.resetButton);

    const htmlContent = this.HTMLBuilder.createDiv('widget-html-content');

    this.widgetContent.appendChild(htmlContent);

    this.node.appendChild(this.widgetContent);

    this.node.addEventListener('click', this.clickHandler);
  }

  clickHandler(e) {
    if (e.target === this.node || e.target === this.widgetContent || e.target === this.clickDisplay) {
      e.stopPropagation();
      this.clickCount++;
      this.updateClickDisplay();
    }
  }

  resetClickHandler(e) {
    e.stopPropagation();
    this.clickCount = 0;
    this.updateClickDisplay();
  }

  updateClickDisplay() {
    if (this.clickDisplay) {
      this.clickDisplay.textContent = `Click count: ${this.clickCount}`;
    }
  }

  destroy() {
    this.cleanup();
    super.destroy();
  }

  cleanup() {
    this.node.removeEventListener('click', this.clickHandler);

    if (this.resetButton) {
      this.resetButton.removeEventListener('click', this.resetClickHandler);
    }

    if (this.widgetContent && this.widgetContent.parentNode) {
      this.widgetContent.parentNode.removeChild(this.widgetContent);
      this.widgetContent = null;
      this.clickDisplay = null;
      this.resetButton = null;
    }
  }
}

export default CounterWidget;