import { BaseWidget } from '../BaseWidget.js';
import HtmlBuilder from '../utils/HtmlBuilder.js';

class IncrementWidget extends BaseWidget {
  constructor(node) {
    super(node);
    this.counter = 0;
    this.htmlBuilder = new HtmlBuilder(this.document);
  }
  
  async initContent() {    
    this.widgetContent = this.htmlBuilder.createDiv('widget-content');
    
    this.infoSpan = this.htmlBuilder.createElement('span', 'widget-counter', `Counter: ${this.counter}`);
    this.widgetContent.appendChild(this.infoSpan);
    
    this.button = this.htmlBuilder.createButton('widget-button', 'Increment');
    this.button.addEventListener('click', this.buttonClickHandler);
    this.widgetContent.appendChild(this.button);
    
    this.node.appendChild(this.widgetContent);
    
    const htmlContent = this.htmlBuilder.createDiv('widget-html-content');
    this.widgetContent.appendChild(htmlContent);
  }
  
  buttonClickHandler(e) {
    e.stopPropagation();
    this.counter++;
    this.infoSpan.textContent = `Counter: ${this.counter}`;
  }
  
  destroy() {
    this.cleanup();
    super.destroy();
  }
  
  cleanup() {
    if (this.button) {
      this.button.removeEventListener('click', this.buttonClickHandler);
    }
    
    if (this.widgetContent && this.widgetContent.parentNode) {
      this.widgetContent.parentNode.removeChild(this.widgetContent);
      this.widgetContent = null;
      this.button = null;
      this.infoSpan = null;
    }
  }
}

export default IncrementWidget;