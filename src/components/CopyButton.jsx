export default function CopyButton({ text }) {
  const copy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Copied");
  };

  return (
    <button onClick={copy} disabled={!text}>
      Copy Code
    </button>
  );
}
