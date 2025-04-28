import { BaseWidget } from '../BaseWidget.js';
import HtmlBuilder from '../utils/HtmlBuilder.js';

class AnimationWidget extends BaseWidget {
  constructor(node) {
    super(node);
    this.animationActive = false;
    this.progress = 0;
    this.htmlBuilder = new HtmlBuilder(this.document);
  }

  async initContent() {
    this.widgetContent = this.htmlBuilder.createDiv('widget-content');

    const label = this.htmlBuilder.createDiv('widget-label', 'Animation Progress');
    this.widgetContent.appendChild(label);

    const progressContainer = this.htmlBuilder.createDiv('widget-progress');
    
    this.progressBar = this.htmlBuilder.createDiv('widget-progress-bar');
    this.progressBar.style.width = '0%';
    
    progressContainer.appendChild(this.progressBar);
    this.widgetContent.appendChild(progressContainer);

    this.toggleButton = this.htmlBuilder.createButton('widget-button', 'Start Animation');
    this.toggleButton.addEventListener('click', this.toggleAnimationHandler);
    this.widgetContent.appendChild(this.toggleButton);

    const htmlContent = this.htmlBuilder.createDiv('widget-html-content');
    this.widgetContent.appendChild(htmlContent);

    this.node.appendChild(this.widgetContent);
  }

  toggleAnimationHandler(e) {
    e.stopPropagation();

    this.animationActive = !this.animationActive;
    this.toggleButton.textContent = this.animationActive ? 'Stop Animation' : 'Start Animation';
    
    if (this.animationActive) {
      this.toggleButton.style.background = 'var(--danger-color)';
      this.startAnimation();
    } else {
      this.toggleButton.style.background = 'var(--primary-color)';
      this.stopAnimation();
    }
  }

  startAnimation() {
    if (this.animationId) return;

    const animate = () => {
      if (!this.animationActive) return;

      this.progress = (this.progress + 1) % 101;
      if (this.progressBar) {
        this.progressBar.style.width = `${this.progress}%`;
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.cleanup();
    super.destroy();
  }
  
  cleanup() {
    this.stopAnimation();
    this.animationActive = false;
    
    if (this.toggleButton) {
      this.toggleButton.removeEventListener('click', this.toggleAnimationHandler);
    }
    
    if (this.widgetContent && this.widgetContent.parentNode) {
      this.widgetContent.parentNode.removeChild(this.widgetContent);
      this.widgetContent = null;
      this.toggleButton = null;
      this.progressBar = null;
    }
  }
}

export default AnimationWidget;