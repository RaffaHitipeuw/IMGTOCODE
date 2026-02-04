import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function OcrResult({ text }) {
  return (
    <div style={{ borderRadius: 8, overflow: "hidden" }}>
      <SyntaxHighlighter
        language="clike"
        style={oneDark}
        showLineNumbers
        wrapLongLines
        customStyle={{
          minHeight: 320,
          fontSize: 14,
          lineHeight: "1.6",
        }}
      >
        {text || "//"}
      </SyntaxHighlighter>
    </div>
  );
}
