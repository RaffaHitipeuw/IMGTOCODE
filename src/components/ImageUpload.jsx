export default function ImageUpload({ onUpload }) {
  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => onUpload(e.target.files[0])}
    />
  );
}
