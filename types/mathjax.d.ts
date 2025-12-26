interface MathJaxGlobal {
  typesetPromise?: (elements?: Element[]) => Promise<void>;
}

declare global {
  interface Window {
    MathJax?: MathJaxGlobal;
  }
}

export {};
