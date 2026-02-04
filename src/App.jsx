import { useState } from "react";
import Tesseract from "tesseract.js";
import ImageUpload from "./components/ImageUpload";
import OcrResult from "./components/OcrResult";
import CopyButton from "./components/CopyButton";

function formatCode(text) {
  if (!text) return "";

  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\t/g, "  ")
    .split("\n");

  let indent = 0;
  const INDENT = "  ";
  const out = [];

  let lastEmpty = false;

  for (let raw of lines) {
    let line = raw.trim();

    if (!line) {
      if (!lastEmpty) out.push("");
      lastEmpty = true;
      continue;
    }
    lastEmpty = false;

    if (line.length <= 1) continue;
    if (/^[A-Z][a-z]{1,2}$/.test(line)) continue;

    if (
      line.startsWith("}") ||
      line.startsWith(");") ||
      line === "end"
    ) {
      indent = Math.max(indent - 1, 0);
    }

    out.push(INDENT.repeat(indent) + line);

    if (
      line.endsWith("{") ||
      line.endsWith(":") ||
      line.endsWith("then") ||
      line.endsWith("do")
    ) {
      indent++;
    }
  }

  return out.join("\n");
}

export default function App() {
  const [image, setImage] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const runOCR = async () => {
    if (!image) {
      alert("upload image dulu");
      return;
    }

    setLoading(true);

    try {
      const { data } = await Tesseract.recognize(
        image,
        "eng",
        {
          logger: () => {},

          tessedit_char_whitelist:
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_{}[]()<>;:.,+-=*/!@#$%^&|\"'`~\\n\\t ",

          preserve_interword_spaces: "1",
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
          classify_bln_numeric_mode: "0",
        }
      );

      setCode(formatCode(data.text));
    } catch (e) {
      console.error(e);
      alert("OCR failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 1100 }}>

      <ImageUpload onUpload={setImage} />

      <br /><br />

      <button onClick={runOCR} disabled={loading}>
        {loading ? "processing..." : "Convert"}
      </button>

      <br /><br />

      <OcrResult text={code} />

      <br />

      <CopyButton text={code} />
    </div>
  );
}
