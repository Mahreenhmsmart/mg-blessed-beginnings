/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Allow data-icod-id tracking attribute on all JSX elements (including custom components)
declare namespace JSX {
  interface IntrinsicAttributes {
    'data-icod-id'?: string;
  }
}
