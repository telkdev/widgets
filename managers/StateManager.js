import { EventEmitter } from "../EventEmitter.js";

const WidgetState = {
  INIT: 'initializing',
  DONE: 'done',
  FAIL: 'fail',
  DESTROY: 'destroy',
  NONE: 'none'
};

export class StateManager {
  #activeInits = new Map();
  #destroyedWidgets = new Set();

  resetWidget(widget) {
    if (widget) {
      widget.events = new EventEmitter();
      widget.state = WidgetState.NONE;
    }
  }

  get activeInits() {
    return this.#activeInits;
  }

  registerCallback(widget, callback) {
    this.#activeInits.set(widget, callback);
  }

  unregisterCallback(widget) {
    this.#activeInits.delete(widget);
  }

  getCallback(widget) {
    return this.#activeInits.get(widget);
  }

  hasCallback(widget) {
    return this.#activeInits.has(widget);
  }

  markDestroyed(widget) {
    this.#destroyedWidgets.add(widget);
  }

  unmarkDestroyed(widget) {
    this.#destroyedWidgets.delete(widget);
  }

  isDestroyed(widget) {
    return this.#destroyedWidgets.has(widget);
  }

  isInitedState(widget) {
    return widget.state === WidgetState.INIT;
  }

  isDoneState(widget) {
    return widget.state === WidgetState.DONE;
  }

  isFailState(widget) {
    return widget.state === WidgetState.FAIL;
  }

  isDestroyedState(widget) {
    return widget.state === WidgetState.DESTROY || this.isDestroyed(widget);
  }

  isEffectivelyDone(widget) {
    return widget.state === 'done' ||
      widget.state === 'fail' ||
      widget.state === 'destroy' ||
      this.isDestroyed(widget);
  }
}