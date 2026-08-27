import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setFileName(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInsert = () => {
    const name = fileName || 'image.png';
    let latex = '\\begin{figure}[htbp]\n\\centering\n';
    latex += `\\includegraphics[width=${width}\\textwidth]{${name}}\n`;
    if (caption) latex += `\\caption{${caption}}\n`;
    if (label) latex += `\\label{${label}}\n`;
    latex += '\\end{figure}';
    onInsert(latex);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative border border-texflow-800 rounded-2xl shadow-2xl w-full max-w-md mx-4" style={{ background: '#FBEFEF' }}>
        <div className="flex items-center justify-between p-4 border-b border-texflow-800">
          <div className="flex items-center gap-2"><ImageIcon size={18} className="text-texflow-400" /><h2 className="text-lg font-semibold text-texflow-900">Insert Image</h2></div>
          <button onClick={onClose} className="p-1 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-texflow-400 bg-texflow-900/20' : 'border-texflow-800 hover:border-texflow-600'}`}>
            <Upload className="mx-auto h-8 w-8 text-texflow-500 mb-2" />
            <p className="text-sm text-texflow-700">{fileName || 'Drop an image here or click to browse'}</p>
            <p className="text-xs text-texflow-500 mt-1">PNG, JPG, SVG up to 10MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          <div><label className="block text-xs text-texflow-600 mb-1">Caption</label><input value={caption} onChange={e => setCaption(e.target.value)} className="input-field w-full text-sm" placeholder="Image caption" /></div>
          <div className="flex gap-3">
            <div className="flex-1"><label className="block text-xs text-texflow-600 mb-1">Label</label><input value={label} onChange={e => setLabel(e.target.value)} className="input-field w-full text-sm" placeholder="fig:label" /></div>
            <div className="w-24"><label className="block text-xs text-texflow-600 mb-1">Width</label><select value={width} onChange={e => setWidth(e.target.value)} className="input-field w-full text-sm"><option value="0.5">50%</option><option value="0.8">80%</option><option value="1.0">100%</option></select></div>
          </div>
          <div className="flex justify-end gap-2 pt-2"><button onClick={onClose} className="btn-ghost">Cancel</button><button onClick={handleInsert} className="btn-primary">Insert Image</button></div>
        </div>
      </div>
    </div>
  );
}