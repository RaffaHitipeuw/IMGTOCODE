import { useState } from "react";
import Tesseract from "tesseract.js";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ImageUpload from "./components/ImageUpload";

function cleanOCR(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[|¦]/g, "")
    .replace(/\t/g, "  ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectLanguage(code) {
  if (/<\/?\w+/.test(code)) {
    if (/className=|<>/.test(code)) return "jsx";
    return "html";
  }
  if (/def\s+\w+|\:\s*$/.test(code)) return "python";
  if (/function|=>|const|let/.test(code)) return "javascript";
  return "text";
}

function formatJSX(code) {
  let indent = 0;
  const out = [];

  for (let raw of code.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("}") || /^<\/\w/.test(line)) {
      indent = Math.max(indent - 1, 0);
    }

    out.push("  ".repeat(indent) + line);

    if (
      line.endsWith("{") ||
      (/^<\w/.test(line) &&
        !line.includes("/>") &&
        !line.includes("</"))
    ) {
      indent++;
    }
  }

  return out.join("\n");
}

function formatJS(code) {
  return formatJSX(
    code
      .replace(/;\s*/g, ";\n")
      .replace(/\{\s*/g, "{\n")
      .replace(/\}\s*/g, "\n}")
  );
}

function formatPython(code) {
  return code
    .split("\n")
    .map(l => l.trimEnd())
    .join("\n");
}

function heuristicFormat(text) {
  const cleaned = cleanOCR(text);
  const lang = detectLanguage(cleaned);

  if (lang === "jsx" || lang === "html") return formatJSX(cleaned);
  if (lang === "javascript") return formatJS(cleaned);
  if (lang === "python") return formatPython(cleaned);

  return cleaned;
}

async function aiRefine(code) {
  await new Promise(r => setTimeout(r, 400));

  return code
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

export default function App() {
  const [image, setImage] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);

  const runOCR = async () => {
    if (!image) {
      alert("paste / upload image dulu");
      return;
    }

    setLoading(true);

    try {
      const { data } = await Tesseract.recognize(image, "eng", {
        tessedit_pageseg_mode: 6,
        preserve_interword_spaces: 1,
      });

      let formatted = heuristicFormat(data.text);

      if (useAI) {
        formatted = await aiRefine(formatted);
      }

      setCode(formatted);
    } catch (err) {
      console.error(err);
      alert("OCR error");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

      <ImageUpload onUpload={setImage} />

      <br />

      <button onClick={runOCR} disabled={loading}>
        {loading ? "Thinking..." : "Convert"}
      </button>

      <br /><br />

      <SyntaxHighlighter
        language="javascript"
        style={oneDark}
        showLineNumbers
        customStyle={{ minHeight: 320 }}
      >
        {code || "//"}
      </SyntaxHighlighter>

      <button
        onClick={() => navigator.clipboard.writeText(code)}
        disabled={!code}
      >
        Copy Code
      </button>
    </div>
  );
}