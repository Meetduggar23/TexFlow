import { useState } from 'react';
import { X, Table } from 'lucide-react';

interface TableBuilderProps {
  onInsert: (latex: string) => void;
  onClose: () => void;
}

export default function TableBuilder({ onInsert, onClose }: TableBuilderProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [alignment, setAlignment] = useState('l');
  const [caption, setCaption] = useState('');
  const [label, setLabel] = useState('');
  const [cells, setCells] = useState<string[][]>(Array(3).fill(null).map(() => Array(3).fill('')));
  const [headerRow, setHeaderRow] = useState(true);

  const updateCell = (r: number, c: number, val: string) => {
    const next = cells.map(row => [...row]);
    next[r][c] = val;
    setCells(next);
  };

  const changeSize = (newRows: number, newCols: number) => {
    const next = Array(newRows).fill(null).map((_, r) => Array(newCols).fill('').map((_, c) => cells[r]?.[c] || ''));
    setCells(next);
    setRows(newRows);
    setCols(newCols);
  };

  const handleInsert = () => {
    const colSpec = Array(cols).fill(alignment).join('');
    let latex = '\\begin{table}[htbp]\n\\centering\n';
    if (caption) latex += `\\caption{${caption}}\n`;
    if (label) latex += `\\label{${label}}\n`;
    latex += `\\begin{tabular}{${colSpec}}\n\\hline\n`;
    cells.forEach((row, r) => {
      latex += row.join(' & ') + ' \\\\\n';
      if (headerRow && r === 0) latex += '\\hline\n';
    });
    latex += '\\hline\n\\end{tabular}\n\\end{table}';
    onInsert(latex);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative border border-texflow-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4" style={{ background: 'var(--color-background)' }}>
        <div className="flex items-center justify-between p-4 border-b border-texflow-800">
          <div className="flex items-center gap-2"><Table size={18} className="text-texflow-400" /><h2 className="text-lg font-semibold text-texflow-900">Table Builder</h2></div>
          <button onClick={onClose} className="p-1 text-texflow-600 hover:text-texflow-900 hover:bg-texflow-200 rounded"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <div><label className="block text-xs text-texflow-600 mb-1">Rows</label><input type="number" min={1} max={20} value={rows} onChange={e => changeSize(parseInt(e.target.value) || 1, cols)} className="input-field w-20 text-sm" /></div>
            <div><label className="block text-xs text-texflow-600 mb-1">Columns</label><input type="number" min={1} max={10} value={cols} onChange={e => changeSize(rows, parseInt(e.target.value) || 1)} className="input-field w-20 text-sm" /></div>
            <div><label className="block text-xs text-texflow-600 mb-1">Alignment</label><select value={alignment} onChange={e => setAlignment(e.target.value)} className="input-field text-sm"><option value="l">Left</option><option value="c">Center</option><option value="r">Right</option></select></div>
            <div className="flex items-end"><label className="flex items-center gap-2 text-sm text-texflow-700"><input type="checkbox" checked={headerRow} onChange={e => setHeaderRow(e.target.checked)} className="accent-[var(--color-accent)]" /> Header row</label></div>
          </div>
          <div className="overflow-auto"><table className="w-full border-collapse"><tbody>{cells.map((row, r) => (<tr key={r}>{row.map((cell, c) => (<td key={c} className="p-0.5"><input value={cell} onChange={e => updateCell(r, c, e.target.value)} className="input-field w-full text-xs text-center" placeholder={r === 0 && headerRow ? `H${c + 1}` : ''} /></td>))}</tr>))}</tbody></table></div>
          <div className="flex gap-4">
            <div className="flex-1"><label className="block text-xs text-texflow-600 mb-1">Caption</label><input value={caption} onChange={e => setCaption(e.target.value)} className="input-field w-full text-sm" placeholder="Table caption" /></div>
            <div className="flex-1"><label className="block text-xs text-texflow-600 mb-1">Label</label><input value={label} onChange={e => setLabel(e.target.value)} className="input-field w-full text-sm" placeholder="tab:label" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2"><button onClick={onClose} className="btn-ghost">Cancel</button><button onClick={handleInsert} className="btn-primary">Insert Table</button></div>
        </div>
      </div>
    </div>
  );
}
