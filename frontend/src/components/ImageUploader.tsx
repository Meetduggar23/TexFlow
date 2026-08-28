import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onInsert: (latex: string) => void;
  onClose: () => void;
}

export default function ImageUploader({ onInsert, onClose }: ImageUploaderProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [caption, setCaption] = useState('');
  const [label, setLabel] = useState('');
  const [width, setWidth] = useState('0.8');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return; }
    setFile(file);
    setFileName(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file || !projectId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/upload/image', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      
      toast.success('Image uploaded');
      handleInsert(data.file.name);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleInsert = (name?: string) => {
    const imageName = name || fileName || 'image.png';
    let latex = '\\begin{figure}[htbp]\n\\centering\n';
    latex += `\\includegraphics[width=${width}\\textwidth]{${imageName}}\n`;
    if (caption) latex += `\\caption{${caption}}\n`;
    if (label) latex += `\\label{${label}}\n`;
    latex += '\\end{figure}';
    onInsert(latex);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative border rounded-2xl shadow-2xl w-full max-w-md mx-4" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2"><ImageIcon size={18} style={{ color: 'var(--color-accent)' }} /><h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Insert Image</h2></div>
          <button onClick={onClose} className="p-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-elevated)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}>
            <Upload className="mx-auto h-8 w-8 mb-2" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: fileName ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{fileName || 'Drop an image here or click to browse'}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>PNG, JPG, SVG up to 10MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          <div><label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Caption</label><input value={caption} onChange={e => setCaption(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} placeholder="Image caption" /></div>
          <div className="flex gap-3">
            <div className="flex-1"><label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Label</label><input value={label} onChange={e => setLabel(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }} placeholder="fig:label" /></div>
            <div className="w-24"><label className="block text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Width</label><select value={width} onChange={e => setWidth(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none cursor-pointer" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-primary)' }}><option value="0.5">50%</option><option value="0.8">80%</option><option value="1.0">100%</option></select></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>Cancel</button>
            <button onClick={handleUpload} disabled={!file || uploading} className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2" style={{ background: 'var(--color-accent)' }}>
              {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Upload & Insert</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}