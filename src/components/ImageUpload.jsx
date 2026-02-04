import { useRef, useState } from "react";

export default function ImageUpload({ onUpload }) {
  const ref = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.includes("image")) {
        const file = item.getAsFile();
        const url = URL.createObjectURL(file);

        setPreview(url);
        setError("");
        onUpload(file);
        e.preventDefault();
        return;
      }
    }
    setError("img only");
  };

  return (
    <div
      ref={ref}
      tabIndex={0}
      onPaste={handlePaste}
      onClick={() => ref.current.focus()}
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        backgroundColor: "#f9f9f9",
        cursor: "pointer"
      }}
    >
      {preview ? (
        <div>
          <img 
            src={preview} 
            alt="preview" 
            style={{ display: "block", maxWidth: "200px", marginBottom: "10px" }} 
          />
          <span style={{ fontSize: "12px"}}>pasted</span>
        </div>
      ) : (
        <div>
          <strong>click, control + v</strong>
          {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}