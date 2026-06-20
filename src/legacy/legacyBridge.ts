// Extend Window interface to support legacy global functions
declare global {
  interface Window {
    openWorkspace?: (name: string, screen: string) => void;
    incrementClone?: (name: string) => void;
    showToast?: (msg: string, duration?: number) => void;
    showOaToast?: (msg: string, duration?: number) => void;
    openModal?: (id: string) => void;
    closeModal?: (id: string) => void;
    switchScreen?: (index: number, name: string, btn: HTMLElement) => void;
    openTemplate?: (name: string) => void;
  }
}

// Internal backup storage for handlers that get registered by legacy scripts later
const handlers: Record<string, any> = {};

// Helper to define dynamic delegate properties on window
function defineBridgeProperty(propName: string, targetKey: string = propName) {
  Object.defineProperty(window, propName, {
    get() {
      return (...args: any[]) => {
        const actualFn = handlers[targetKey];
        if (typeof actualFn === 'function') {
          return actualFn(...args);
        } else {
          console.warn(`Bridge: window.${propName} called but no implementation for ${targetKey} is registered yet.`);
        }
      };
    },
    set(value) {
      handlers[targetKey] = value;
    },
    configurable: true,
    enumerable: true
  });
}

// Special wrap for openWorkspace to include exactly the requested logs
Object.defineProperty(window, 'openWorkspace', {
  get() {
    return (name: string, screen: string) => {
      console.log('Template clicked');
      const actualFn = handlers['openWorkspace'];
      if (typeof actualFn === 'function') {
        const result = actualFn(name, screen);
        console.log('Template loaded');
        console.log('Screens loaded');
        console.log('Workspace rendered');
        return result;
      } else {
        console.warn('Bridge: window.openWorkspace called but no legacy implementation is registered yet.');
      }
    };
  },
  set(value) {
    handlers['openWorkspace'] = value;
  },
  configurable: true,
  enumerable: true
});

// Define the rest of the core compatibility functions
defineBridgeProperty('incrementClone');
defineBridgeProperty('showOaToast');
defineBridgeProperty('openModal');
defineBridgeProperty('closeModal');
defineBridgeProperty('switchScreen');

// Special mapping for showToast -> showOaToast
Object.defineProperty(window, 'showToast', {
  get() {
    return (msg: string, duration?: number) => {
      console.log('Toast:', msg);
      const actualToast = handlers['showOaToast'] || (window as any).showOaToast;
      if (typeof actualToast === 'function') {
        actualToast(msg, duration);
      } else {
        console.log(`[Toast Fallback] ${msg}`);
      }
    };
  },
  configurable: true,
  enumerable: true
});

// Special mapping for openTemplate -> openWorkspace
Object.defineProperty(window, 'openTemplate', {
  get() {
    return (name: string) => {
      console.log('Template clicked:', name);
      const openWS = (window as any).openWorkspace;
      if (typeof openWS === 'function') {
        openWS(name, '');
      } else {
        console.warn(`Bridge: window.openWorkspace not found for openTemplate(${name})`);
      }
    };
  },
  configurable: true,
  enumerable: true
});

console.log('Legacy compatibility bridge successfully initialized.');
export {};
