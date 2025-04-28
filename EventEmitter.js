export class EventEmitter {
  #events = new Map();

  on(event, listener) {
    if (!this.#events.has(event)) {
      this.#events.set(event, []);
    }
    this.#events.get(event).push(listener);
    
    return this;
  }

  emit(event, ...args) {
    const listeners = this.#events.get(event);
    
    if (!listeners) return false;
    
  
    for (const listener of listeners) {
      listener(...args);
    }
    
    return true;
  }
  
  off(event, listener) {
    if (!this.#events.has(event)) return this;
    
    
    if (!listener) {
      this.#events.delete(event);
      return this;
    }
    
    const listeners = this.#events.get(event);
    const index = listeners.indexOf(listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      if (listeners.length === 0) {
        this.#events.delete(event);
      }
    }
    
    return this;
  }
}