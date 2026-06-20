export interface ScreenConfig {
  id: string; // unique screen id, e.g. 'dashboard', 'sprint-board'
  name: string; // display name
  icon: string; // SVG path
}

export interface TemplateConfig {
  id: string; // template-id matching card-id (slugified name)
  name: string; // display name
  color: string; // theme color
  cat: string; // category
  screens: ScreenConfig[]; // list of screens
}

class TemplateRegistryClass {
  private templates: Map<string, TemplateConfig> = new Map();

  registerTemplate(template: TemplateConfig) {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): TemplateConfig | undefined {
    return this.templates.get(id);
  }

  getAll(): TemplateConfig[] {
    return Array.from(this.templates.values());
  }
}

class ScreenRegistryClass {
  private screens: Map<string, (c: string) => string> = new Map();

  registerScreen(screenId: string, loader: (c: string) => string) {
    this.screens.set(screenId, loader);
  }

  getScreen(screenId: string): ((c: string) => string) | undefined {
    return this.screens.get(screenId);
  }
}

export const TemplateRegistry = new TemplateRegistryClass();
export const ScreenRegistry = new ScreenRegistryClass();

// Helper to slugify names
export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Make them globally available for scripts and onclick handlers
(window as any).TemplateRegistry = TemplateRegistry;
(window as any).ScreenRegistry = ScreenRegistry;
(window as any).registerTemplate = (tpl: TemplateConfig) => TemplateRegistry.registerTemplate(tpl);
(window as any).registerScreen = (screenId: string, loader: (c: string) => string) => ScreenRegistry.registerScreen(screenId, loader);
(window as any).slugify = slugify;
