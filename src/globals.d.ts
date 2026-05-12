/// <reference types="@cloudflare/workers-types" />

declare global {
  const marked: {
    parse: (markdown: string) => string | Promise<string>;
  };

  const DOMPurify: {
    sanitize: (html: string, config?: { ALLOWED_TAGS?: string[]; ALLOWED_ATTR?: string[] }) => string;
  };
}

export {};
