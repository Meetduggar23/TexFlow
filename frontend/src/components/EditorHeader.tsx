import { ArrowLeft, Play, PanelLeftClose, PanelLeftOpen, Users, Download, Share2, History, MessageSquare, Search, Command } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleSidebar } from '../store/uiSlice';
import { togglePdf } from '../store/editorSlice';
import type { Project } from '../types';

interface EditorHeaderProps {
  project: Project;
  onCompile: () => void;
  onBack: () => void;
  onToggleComments: () => void;
  onToggleHistory: () => void;
  onToggleShare: () => void;
}

export default function EditorHeader({ project, onCompile, onBack, onToggleComments, onToggleHistory, onToggleShare }: EditorHeaderProps) {
  const dispatch = useAppDispatch();
  const { compiling, pdfVisible } = useAppSelector(state => state.editor);
  const { sidebarOpen } = useAppSelector(state => state.ui);

  return (
    <header className="h-12 border-b border-texflow-800 bg-dark-900/80 backdrop-blur-sm flex items-center px-3 gap-2">
      <button onClick={onBack} className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors">
        <ArrowLeft size={16} />
      </button>
      <button onClick={() => dispatch(toggleSidebar())} className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors">
        {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>
      <div className="w-px h-5 bg-texflow-800" />
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
        <span className="text-sm font-medium text-white">{project.name}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <div className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400">
          <Users size={14} />
          <span>{project.collaborators?.length || 1}</span>
        </div>
        <div className="w-px h-5 bg-texflow-800" />
        <button onClick={onToggleComments} className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors" title="Comments">
          <MessageSquare size={16} />
        </button>
        <button onClick={onToggleHistory} className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors" title="History">
          <History size={16} />
        </button>
        <button onClick={onToggleShare} className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-700 rounded transition-colors" title="Share">
          <Share2 size={16} />
        </button>
        <div className="w-px h-5 bg-texflow-800" />
        <button onClick={() => dispatch(togglePdf())} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${pdfVisible ? 'text-texflow-300' : 'text-slate-400 hover:text-white hover:bg-dark-700'}`} style={pdfVisible ? { background: 'rgba(114,4,85,0.2)' } : {}}>
          PDF
        </button>
        <button onClick={onCompile} disabled={compiling} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded transition-all disabled:opacity-50" style={{ background: compiling ? '#3C0753' : 'linear-gradient(135deg, #720455, #910A67)' }}>
          {compiling ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> : <Play size={12} />}
          {compiling ? 'Compiling...' : 'Compile'}
        </button>
      </div>
    </header>
  );
}
