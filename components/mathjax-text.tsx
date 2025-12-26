import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
} from "react-native";

type Props = {
  content: string;
  style?: StyleProp<TextStyle>;
  displayMode?: boolean;
};

const SCRIPT_ID = "matrix-mathjax-script";
const SCRIPT_SRC =
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";

export default function MathJaxText({
  content,
  style,
  displayMode = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mathJaxReady, setMathJaxReady] = useState(Platform.OS !== "web");

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const existing = document.getElementById(SCRIPT_ID);
    const handleLoad = () => setMathJaxReady(true);

    if (existing) {
      if (window.MathJax) {
        setMathJaxReady(true);
        return;
      }
      existing.addEventListener("load", handleLoad);
      return () => {
        existing.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", (event) => {
      console.error("Failed to load MathJax", event);
    });
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const node = containerRef.current;
    if (!node) return;

    if (!mathJaxReady || !window.MathJax?.typesetPromise) {
      node.textContent = content;
      return;
    }

    const escaped = escapeForHtml(content);
    const wrapped = displayMode ? `\\[${escaped}\\]` : `\\(${escaped}\\)`;
    node.innerHTML = wrapped;
    window.MathJax.typesetPromise([node]).catch((error) => {
      console.error("MathJax typeset failed", error);
    });
  }, [content, displayMode, mathJaxReady]);

  if (Platform.OS !== "web") {
    return <Text style={style}>{content}</Text>;
  }

  const flattened = StyleSheet.flatten(style) || {};
  const webStyle = flattened as unknown as CSSProperties;

  return <div ref={containerRef} style={webStyle} />;
}

function escapeForHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
