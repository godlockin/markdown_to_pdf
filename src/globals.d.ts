/// <reference types="@cloudflare/workers-types" />

declare global {
  interface Window {
    performanceMetrics: {
      renderCount: number;
      totalRenderTime: number;
      lastRenderTime: number;
      maxRenderTime: number;
      minRenderTime: number;
      memoryUsage: number;
      recordRender: (duration: number) => void;
      updateMemory: () => void;
      getAverageRenderTime: () => number;
      formatBytes: (bytes: number) => string;
      getMetrics: () => Record<string, number | string>;
    };
    confirmClear: () => Promise<boolean>;
  }

  const marked: {
    parse: (markdown: string) => string | Promise<string>;
  };

  const DOMPurify: {
    sanitize: (html: string, config?: { ALLOWED_TAGS?: string[]; ALLOWED_ATTR?: string[] }) => string;
  };

  const html2pdf: () => {
    set: (options: Record<string, unknown>) => html2pdf;
    from: (element: HTMLElement) => html2pdf;
    save: () => Promise<void>;
  };
}

export {};
