export class WidgetErrorsManager {
  constructor() {
    this.errors = []
  }

  addError(error) {
    this.errors.push(error)
  }

  getErrors() {
    return this.errors
  }

  clearErrors() {
    this.errors = []
  }

  get hasErrors() {
    return this.errors.length > 0
  }


  makeWidgetFailedError(widget) {
    this.makeError(widget, 'Widget failed')
  }

  makeWidgetDestroyedError(widget) {
    this.makeError(widget, 'Widget destroyed')
  }

  makeError(widget, reason) {
    this.addError({
      widget,
      reason
    })
  }
}