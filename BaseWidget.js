import { env } from "./EnvironmentDetector.js";
import { EventEmitter } from "./EventEmitter.js";

class BaseWidget {
  #state = 'none';
  #contentInitialized = false;

  constructor(node, dependencies = {}) {
    this.node = node;
    this.id = node.getAttribute('widget');

    this.document = dependencies.document || env.document;

    this.events = dependencies.eventEmitter || new EventEmitter();
    this.logger = dependencies.logger || console;

    this.#bindHandlers();
  }

  #bindHandlers() {
    const proto = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(proto).filter(
      name => typeof this[name] === 'function' && name !== 'constructor'
    );

    for (const methodName of methodNames) {
      if (methodName.endsWith('Handler')) {
        const originalHandler = this[methodName];

        this[methodName] = (...args) => {
          if (this.#state !== 'done') {
            this.logger.log(`Widget ${this.id} not ready (state: ${this.#state}), ignoring handler call`);
            return;
          }
          return originalHandler.apply(this, args);
        };

        this[methodName] = this[methodName].bind(this);
      }
    }
  }

  get state() {
    return this.#state;
  }

  set state(val) {
    this.#state = val;

    if (typeof this.node.classList !== 'undefined') {
      this.node.classList.remove('widget-initializing', 'widget-done', 'widget-failed');
      if (val === 'initializing') {
        this.node.classList.add('widget-initializing');
      } else if (val === 'done') {
        this.node.classList.add('widget-done');
      } else if (val === 'fail') {
        this.node.classList.add('widget-failed');
      }
    }
  }

  async init() {
    if (this.#state === 'done' || this.#state === 'fail') {
      this.logger.log(`Widget ${this.id} already in ${this.#state} state, skipping initialization`);
      return;
    }

    if (this.#state === 'initializing') {
      this.logger.log(`Widget ${this.id} already initializing, skipping duplicate initialization`);
      return;
    }

    this.logger.log('Widget initializing:', this.id);
    this.state = 'initializing';

    await this.#ensureContentInitialized();
  }

  // Template method for subclasses to override - public contract
  async initContent() {
    // Empty implementation by default
    return Promise.resolve();
  }

  async #ensureContentInitialized() {
    if (!this.#contentInitialized) {
      await this.initContent();
      this.#contentInitialized = true;
    }
  }

  done() {
    // Cannot transition from fail to done
    if (this.#state === 'fail') {
      this.logger.log(`Widget ${this.id} is in failed state and cannot be marked as done`);
      return Promise.resolve();
    }
    
    if (this.#state === 'done' || this.#state === 'none') return;
        this.state = 'done';
    this.logger.log('Widget done:', this.id);
    this.events.emit('done', this);
    
    // Initialize content in the background if needed
    if (!this.#contentInitialized) {
      this.#ensureContentInitialized().catch(err => {
        this.logger.error('Error initializing widget content:', err);
      });
    }
    
    return Promise.resolve();
  }

  fail() {
    if (this.#state === 'fail' || this.#state === 'done') return;
    
    this.state = 'fail';
    this.logger.log('Widget failed:', this.id);
    this.events.emit('done', this);
    
    return Promise.resolve();
  }

  destroy() {
    if (this.#state === 'none') return;
    
    if (this.#state !== 'done' && this.#state !== 'fail' && this.#state !== 'initializing') {
      this.logger.log(`Widget ${this.id} must be in 'done' or 'fail' state to be destroyed`);
      return;
    }
    
    const previousState = this.#state;
    this.logger.log('Widget destroyed:', this.id);

    if (typeof this.node.classList !== 'undefined') {
      this.node.classList.remove('widget-initializing', 'widget-done', 'widget-failed');
    }

    this.events.emit('destroy', this);

    if (previousState === 'initializing') {
      this.events.emit('done', this);
    }

    this.#state = 'none';
    this.#contentInitialized = false;
  }

  isActive() {
    return this.#state === 'done';
  }
}

export { BaseWidget, EventEmitter };