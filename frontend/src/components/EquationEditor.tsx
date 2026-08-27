import { useState } from 'react';
import { X, Hash } from 'lucide-react';

interface EquationEditorProps {
  onInsert: (latex: string) => void;
  onClose: () => void;
}

const symbols = [
  { label: 'α', latex: '\\alpha' }, { label: 'β', latex: '\\beta' }, { label: 'γ', latex: '\\gamma' }, { label: 'δ', latex: '\\delta' }, { label: 'ε', latex: '\\epsilon' }, { label: 'θ', latex: '\\theta' }, { label: 'λ', latex: '\\lambda' }, { label: 'μ', latex: '\\mu' }, { label: 'π', latex: '\\pi' }, { label: 'σ', latex: '\\sigma' }, { label: 'φ', latex: '\\phi' }, { label: 'ω', latex: '\\omega' }, { label: 'Δ', latex: '\\Delta' }, { label: 'Σ', latex: '\\Sigma' }, { label: 'Ω', latex: '\\Omega' },
];

const structures = [
  { label: 'Fraction', latex: '\\frac{a}{b}' }, { label: 'Square Root', latex: '\\sqrt{x}' }, { label: 'nth Root', latex: '\\sqrt[n]{x}' }, { label: 'Superscript', latex: 'x^{n}' }, { label: 'Subscript', latex: 'x_{i}' }, { label: 'Sum', latex: '\\sum_{i=1}^{n}' }, { label: 'Product', latex: '\\prod_{i=1}^{n}' }, { label: 'Integral', latex: '\\int_{a}^{b}' }, { label: 'Double Integral', latex: '\\iint' }, { label: 'Limit', latex: '\\lim_{x \\to \\infty}' }, { label: 'Partial', latex: '\\frac{\\partial}{\\partial x}' }, { label: 'Matrix 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' }, { label: 'Matrix 3x3', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}' }, { label: 'Binomial', latex: '\\binom{n}{k}' }, { label: 'Overline', latex: '\\overline{x}' }, { label: 'Hat', latex: '\\hat{x}' }, { label: 'Arrow', latex: '\\vec{x}' }, { label: 'Dot', latex: '\\dot{x}' }, { label: 'Text', latex: '\\text{text}' }, { label: 'Bold', latex: '\\mathbf{x}' }, { label: 'Italic', latex: '\\mathit{x}' },
];

export default function EquationEditor({ onInsert, onClose }: EquationEditorProps) {
  const [equation, setEquation] = useState('');
  const [displayMode, setDisplayMode] = useState(true);

  const insertSymbol = (latex: string) => {
    setEquation(prev => prev + latex);
  };

  const handleInsert = () => {
    const wrapped = displayMode ? `\\[\n${equation}\n\\]` : `$${equation}$`;
    onInsert(wrapped);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative border border-texflow-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4" style={{ background: '#0a0c3d' }}>
        <div className="flex items-center justify-between p-4 border-b border-texflow-800">
          <div className="flex items-center gap-2"><Hash size={18} className="text-texflow-400" /><h2 className="text-lg font-semibold text-white">Equation Editor</h2></div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white hover:bg-dark-700 rounded"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">LaTeX Equation</label>
            <textarea value={equation} onChange={e => setEquation(e.target.value)} className="input-field w-full h-20 font-mono text-sm resize-none" placeholder="E = mc^2" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={displayMode} onChange={e => setDisplayMode(e.target.checked)} className="accent-texflow-500" /> Display mode (\\[ \\])</label>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Greek Letters</p>
            <div className="flex flex-wrap gap-1">
              {symbols.map(s => <button key={s.latex} onClick={() => insertSymbol(s.latex)} className="px-2 py-1 text-sm rounded border border-texflow-800 hover:bg-dark-700 text-slate-300 transition-colors">{s.label}</button>)}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Structures</p>
            <div className="flex flex-wrap gap-1">
              {structures.map(s => <button key={s.latex} onClick={() => insertSymbol(s.latex)} className="px-2 py-1 text-xs rounded border border-texflow-800 hover:bg-dark-700 text-slate-300 transition-colors">{s.label}</button>)}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={handleInsert} disabled={!equation.trim()} className="btn-primary">Insert Equation</button>
          </div>
        </div>
      </div>
    </div>
  );
}