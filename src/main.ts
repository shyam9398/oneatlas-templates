import "./legacy/legacyBridge";
import { initScript0 } from './scripts/script0.ts';
import { initScript1 } from './scripts/script1.ts';
import { initScript2 } from './scripts/script2.ts';
import { initScript3 } from './scripts/script3.ts';
import { initScript4 } from './scripts/script4.ts';
import "./styles/globals.css";
import "./styles/layout.css";
import "./styles/marketplace.css";
import "./styles/workspace.css";
import "./styles/chatbot.css";
import "./styles/dashboard.css";
import "./styles/responsive.css";
import { TemplateRegistry, ScreenRegistry, slugify } from './scripts/registry.ts';
import type { ScreenConfig } from './scripts/registry.ts';

// Initialize extracted scripts
initScript0();
initScript1();
initScript2();
initScript3();
initScript4();

// Register templates/screens and set up routing/toasts after legacies are loaded
function initRegistriesAndRouting() {
  const templates = (window as any).ALL_TEMPLATES || [];
  const templateScreens = (window as any).TEMPLATE_SCREENS || {};
  const defaultScreens = (window as any).DEFAULT_SCREENS || [];

  // Register each template in TemplateRegistry
  templates.forEach((t: any) => {
    const templateId = slugify(t.name);
    
    // Get screens for this template
    const rawScreens = templateScreens[t.name] || defaultScreens;
    const screens: ScreenConfig[] = rawScreens.map((s: any) => ({
      id: slugify(s.name),
      name: s.name,
      icon: s.icon || ''
    }));

    TemplateRegistry.registerTemplate({
      id: templateId,
      name: t.name,
      color: t.color,
      cat: t.cat,
      screens: screens
    });

    // Register each screen in ScreenRegistry
    screens.forEach((screen, index) => {
      const screenId = templateId + '/' + screen.id;
      ScreenRegistry.registerScreen(screenId, (c: string) => {
        // Set global currentTemplateName so renderer knows what to build
        (window as any).currentTemplateName = t.name;
        // Call the globally exposed legacy screen HTML generator
        if (typeof (window as any).getScreenHtml === 'function') {
          return (window as any).getScreenHtml(t.name, index, screen.name, c);
        }
        return '';
      });
    });
  });

  // Handle URL parsing and routing
  function parseCurrentRoute() {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    
    let routePath = '';
    if (pathname.startsWith('/workspace')) {
      routePath = pathname;
    } else if (hash.startsWith('#/workspace')) {
      routePath = hash.slice(1);
    } else if (hash.startsWith('#workspace/')) {
      routePath = '/workspace/' + hash.split('#workspace/')[1];
    }
    
    if (!routePath) return null;
    
    const parts = routePath.split('/').filter(Boolean);
    if (parts[0] === 'workspace' && parts[1]) {
      return {
        templateId: parts[1],
        screenId: parts[2] || null
      };
    }
    return null;
  }

  // Restore state based on initial route
  const route = parseCurrentRoute();
  if (route) {
    const template = TemplateRegistry.getTemplate(route.templateId);
    if (template) {
      (window as any).currentTemplateName = template.name;
      
      setTimeout(() => {
        if (typeof (window as any).openWorkspace === 'function') {
          (window as any).openWorkspace(template.name, '');
          
          if (route.screenId) {
            const checkLoaded = setInterval(() => {
              const sidebarItems = document.querySelectorAll('#ws-screens-list .ws-nav-item');
              if (sidebarItems.length > 0) {
                clearInterval(checkLoaded);
                const screenIndex = template.screens.findIndex(s => s.id === route.screenId);
                if (screenIndex !== -1) {
                  const screen = template.screens[screenIndex];
                  const item = sidebarItems[screenIndex] as HTMLElement;
                  if (typeof (window as any).switchScreen === 'function') {
                    (window as any).switchScreen(screenIndex, screen.name, item);
                  }
                }
              }
            }, 100);
            setTimeout(() => clearInterval(checkLoaded), 5000);
          }
        }
      }, 200);
    } else {
      setTimeout(() => {
        if (typeof (window as any).showTemplateError === 'function') {
          (window as any).showTemplateError();
        }
      }, 500);
    }
  }

  // Set up general event listener for buttons to show toasts/behaviors
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    
    const clickable = target.closest('button, a, .btn, [style*="cursor:pointer"], [onclick], [class*="btn"], .oa-radio-opt, .va-card, .ftab, .cat-card, .ws-nav-item, .saas-nav-item');
    if (!clickable) return;
    
    const text = (clickable.textContent || '').trim().replace(/\s+/g, ' ');
    const lowerText = text.toLowerCase();
    
    // Skip if element has dynamic inline onclick or custom template mapping
    if (clickable.getAttribute('onclick') || clickable.getAttribute('data-tpl')) return;
    
    const showToast = (window as any).showOaToast || ((msg: string) => console.log('Toast:', msg));
    
    if (lowerText.includes('generate report')) {
      showToast('Generating report... ✓');
    } else if (lowerText.includes('export data') || lowerText === 'export') {
      showToast('Exporting data as CSV... ✓');
    } else if (lowerText.includes('import data') || lowerText.includes('import leads') || lowerText === 'import') {
      showToast('Importing data... ✓');
    } else if (lowerText.includes('create') || lowerText.includes('+ add')) {
      showToast('Action triggered: ' + text + ' ✓');
    } else if (lowerText === 'edit' || lowerText.includes('edit details')) {
      showToast('Editing mode enabled ✓');
    } else if (lowerText === 'delete' || lowerText.includes('remove')) {
      showToast('Item deleted successfully ✓');
    } else if (lowerText === 'save' || lowerText.includes('save changes')) {
      showToast('Changes saved successfully ✓');
    } else if (lowerText.includes('view details') || lowerText === 'view') {
      showToast('Showing details... ✓');
    } else if (lowerText.includes('filter') || lowerText === 'search') {
      showToast('Filtering results... ✓');
    } else if (lowerText.includes('ai action') || lowerText.includes('ask ai') || lowerText.includes('ai insight')) {
      showToast('AI generating insights... ✓');
    }
  });

  // Handle popstate for back/forward navigation
  window.addEventListener('popstate', () => {
    const r = parseCurrentRoute();
    if (r) {
      const template = TemplateRegistry.getTemplate(r.templateId);
      if (template) {
        (window as any).currentTemplateName = template.name;
        const ws = document.getElementById('workspace-page');
        if (ws && !ws.classList.contains('visible')) {
          if (typeof (window as any)._showWorkspace === 'function') {
            (window as any)._showWorkspace(template.name);
          }
        }
        if (r.screenId) {
          const screenIndex = template.screens.findIndex(s => s.id === r.screenId);
          if (screenIndex !== -1) {
            const screen = template.screens[screenIndex];
            const sidebarItems = document.querySelectorAll('#ws-screens-list .ws-nav-item');
            const item = sidebarItems[screenIndex] as HTMLElement;
            if (typeof (window as any).switchScreen === 'function') {
              (window as any).switchScreen(screenIndex, screen.name, item);
            }
          }
        }
      }
    } else {
      const ws = document.getElementById('workspace-page');
      if (ws && ws.classList.contains('visible')) {
        if (typeof (window as any).closeWorkspace === 'function') {
          (window as any).closeWorkspace();
        }
      }
    }
  });
}

// Run after legacy init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRegistriesAndRouting);
} else {
  initRegistriesAndRouting();
}

