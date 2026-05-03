import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { uploadToCloudinary } from "../../lib/api";

/**
 * Image upload component using signed Cloudinary upload via backend.
 * Shows preview, supports manual URL entry as fallback.
 */
export default function ImageUploader({ token, value, onChange, folder = "punjab-honda/uploads", testid = "image-uploader" }) {
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { setPreview(value || ""); }, [value]);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErr("Max 5 MB"); return; }
    setErr(""); setUploading(true);
    try {
      const url = await uploadToCloudinary(token, file, folder);
      setPreview(url);
      onChange(url);
    } catch (e) {
      setErr(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div data-testid={testid}>
      <div className="flex gap-3 items-start">
        <div className="w-32 h-24 bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xs">No image</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
            data-testid={`${testid}-file-input`}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black flex items-center gap-2 disabled:opacity-60"
            data-testid={`${testid}-upload-btn`}
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          <input
            type="url"
            value={preview}
            onChange={(e) => { setPreview(e.target.value); onChange(e.target.value); }}
            placeholder="…or paste image URL"
            className="w-full border border-gray-300 px-3 py-2 text-xs rounded-none"
            data-testid={`${testid}-url-input`}
          />
          {preview && (
            <button
              type="button"
              onClick={() => { setPreview(""); onChange(""); }}
              className="text-xs text-red-600 hover:underline flex items-center gap-1"
              data-testid={`${testid}-clear`}
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
          {err && <div className="text-xs text-red-600" data-testid={`${testid}-error`}>{err}</div>}
        </div>
      </div>
    </div>
  );
}
