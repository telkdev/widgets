const DEFAULT_BASE_PATH = './';

export class WidgetResolver {
  constructor(basePath = DEFAULT_BASE_PATH, logger = console) {
    this.basePath = this.parsePath(basePath);
    this.cache = new Map();
    this.logger = logger;
  }

  parsePath(path) {
    return path.endsWith('/') ? path : path + '/';
  }

  async resolve(path) {
    const cachedWidget = this.getWidgetFromCache(path);
    if (cachedWidget) return cachedWidget;

    try {
      const importPath = this.generateImportPath(path);

      const WidgetClass = await this.loadWidgetFromPath(importPath);

      this.cacheWidget(path, WidgetClass);
      return WidgetClass;
    } catch (error) {
      this.handleImportError(path, error);
    }
  }

  cacheWidget(path, WidgetClass) {
    this.cache.set(path, WidgetClass);
  }

  getWidgetFromCache(path) {
    return this.cache.get(path);
  }

  generateImportPath(path) {
    const isAbsoluteOrRelativePath = path.startsWith('./') || path.startsWith('../') || path.startsWith('/');
    return isAbsoluteOrRelativePath ? `${path}.js` : `${this.basePath}${path}.js`;
  }

  async loadWidgetFromPath(importPath) {
    const module = await import(importPath);
    return module.default || module;
  }

  handleImportError(path, error) {
    this.logger.error(`Failed to load widget: ${path}`, error);
    throw new Error(`Failed to load widget: ${path} - ${error.message}`);
  }
}