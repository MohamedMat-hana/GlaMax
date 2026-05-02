/**
 * UploadZone.jsx — Drag-or-click image upload area for admin forms.
 * Shows a preview of the selected image. Calls onFile(File) when a file is chosen.
 */

import { useRef, useState } from 'react';
import './UploadZone.css';

/**
 * @param {{ onFile: (file: File) => void, preview?: string }} props
 */
export default function UploadZone({ onFile, preview }) {
  const inputRef             = useRef(null);
  const [drag, setDrag]      = useState(false);
  const [local, setLocal]    = useState(null);

  const displayed = local || preview || null;

  /** Handle drop or input change */
  function handleFiles(files) {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setLocal(URL.createObjectURL(file));
    onFile(file);
  }

  return (
    <div
      className={`upload-zone ${drag ? 'upload-zone--drag' : ''}`}
      onClick={() => inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
    >
      {displayed ? (
        <img src={displayed} alt="preview" className="upload-zone__preview" />
      ) : (
        <div className="upload-zone__placeholder">
          <span className="upload-zone__icon">🖼</span>
          <p>ارفع صورة المنتج من الجهاز</p>
          <small>اضغط أو اسحب من المكان (JPG أو PNG)</small>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}
