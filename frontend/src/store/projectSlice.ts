import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Project, FileNode } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  files: FileNode[];
  currentFile: FileNode | null;
  loading: boolean;
  error: string | null;
  trashCount: number;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  files: [],
  currentFile: null,
  loading: false,
  error: null,
  trashCount: 0,
};

const API = '/api';

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (filter?: { archived?: boolean }) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (filter?.archived) params.set('archived', 'true');
    const url = params.toString() ? `${API}/projects?${params}` : `${API}/projects`;
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch projects');
    const data = await response.json();
    return data.projects || data;
  }
);

export const fetchProject = createAsyncThunk(
  'project/fetchProject',
  async (projectId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/projects/${projectId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to fetch project');
    const data = await response.json();
    return data.project || data;
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (data: { name: string; description?: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create project');
    const result = await response.json();
    return result.project || result;
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/projects/${projectId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return projectId;
  }
);

export const archiveProject = createAsyncThunk(
  'project/archiveProject',
  async (projectId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/projects/${projectId}/archive`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to archive project');
    const data = await response.json();
    return data.project || data;
  }
);

export const fetchFiles = createAsyncThunk(
  'project/fetchFiles',
  async (projectId: string) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API}/files/project/${projectId}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch files');
    const data = await response.json();
    // Keep both collections; the fulfilled reducer builds the hierarchical tree.
    return data;
  }
);

export const updateFileContent = createAsyncThunk(
  'project/updateFileContent',
  async ({ fileId, content, name }: { fileId: string; content?: string; name?: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/files/${fileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ ...(content !== undefined ? { content } : {}), ...(name !== undefined ? { name } : {}) }),
    });
    if (!response.ok) throw new Error('Failed to update file');
    const data = await response.json();
    return data.file || data;
  }
);

export const createFile = createAsyncThunk(
  'project/createFile',
  async (data: { projectId: string; name: string; parentId: string | null; type: 'file' | 'folder' }) => {
    const token = localStorage.getItem('token');
    const url = data.type === 'folder' ? `${API}/files/folders` : `${API}/files`;
    const body = data.type === 'folder'
      ? { projectId: data.projectId, name: data.name, parentId: data.parentId }
      : { projectId: data.projectId, name: data.name, ...(data.parentId ? { folderId: data.parentId } : {}) };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Failed to create ${data.type}`);
    }
    const result = await response.json();
    const item = result.file || result.folder || result;
    return {
      id: item.id,
      name: item.name,
      type: data.type,
      content: data.type === 'file' ? (item.content || '') : undefined,
      children: data.type === 'folder' ? [] : undefined,
      parentId: data.parentId,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    };
  }
);

export const deleteFile = createAsyncThunk(
  'project/deleteFile',
  async (fileId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/files/${fileId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to delete file');
    return fileId;
  }
);

export const fetchTrashCount = createAsyncThunk(
  'project/fetchTrashCount',
  async () => {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    const response = await fetch(`${API}/projects?trashed=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return (data.projects || []).length;
  }
);

export const emptyTrash = createAsyncThunk(
  'project/emptyTrash',
  async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/projects/trash/empty`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Failed to empty trash');
    const data = await response.json();
    return data.deleted || 0;
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentFile(state, action) {
      state.currentFile = action.payload;
    },
    clearCurrentProject(state) {
      state.currentProject = null;
      state.files = [];
      state.currentFile = null;
    },
    updateFileInTree(state, action) {
      const { fileId, content } = action.payload;
      const updateNode = (nodes: FileNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === fileId) {
            node.content = content;
            node.updatedAt = new Date().toISOString();
            return true;
          }
          if (node.children && updateNode(node.children)) return true;
        }
        return false;
      };
      updateNode(state.files);
      if (state.currentFile?.id === fileId && state.currentFile) {
        state.currentFile.content = content;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.currentProject = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      })
      .addCase(archiveProject.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.projects.findIndex(p => p.id === updated.id);
        if (idx >= 0) {
          state.projects[idx] = updated;
        } else {
          state.projects.unshift(updated);
        }
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        const payload = action.payload;
        const rawFiles = Array.isArray(payload) ? payload : (payload.files || []);
        const rawFolders = Array.isArray(payload) ? [] : (payload.folders || []);

        const folderNodes: FileNode[] = rawFolders.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: 'folder' as const,
          parentId: f.parentId || null,
          children: [],
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        }));

        const fileNodes: FileNode[] = rawFiles.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: 'file' as const,
          content: f.content,
          parentId: f.folderId || null,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        }));

        const allNodes = [...folderNodes, ...fileNodes];
        const nodeMap = new Map<string, FileNode>();
        allNodes.forEach(n => nodeMap.set(n.id, n));

        const roots: FileNode[] = [];
        for (const node of allNodes) {
          if (node.parentId && nodeMap.has(node.parentId)) {
            const parent = nodeMap.get(node.parentId)!;
            if (!parent.children) parent.children = [];
            parent.children.push(node);
          } else {
            roots.push(node);
          }
        }
        state.files = roots;
      })
      .addCase(updateFileContent.fulfilled, (state, action) => {
        const updated = action.payload;
        if (state.currentFile?.id === updated.id) {
          state.currentFile = updated;
        }
      })
      .addCase(createFile.fulfilled, (state, action) => {
        const newFile = action.payload;
        if (newFile.parentId) {
          const addToParent = (nodes: FileNode[]): boolean => {
            for (const node of nodes) {
              if (node.id === newFile.parentId) {
                if (!node.children) node.children = [];
                node.children.push(newFile);
                return true;
              }
              if (node.children && addToParent(node.children)) return true;
            }
            return false;
          };
          addToParent(state.files);
        } else {
          state.files.push(newFile);
        }
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        const fileId = action.payload;
        const removeFromNodes = (nodes: FileNode[]): FileNode[] => {
          return nodes
            .filter(node => node.id !== fileId)
            .map(node => ({
              ...node,
              children: node.children ? removeFromNodes(node.children) : undefined,
            }));
        };
        state.files = removeFromNodes(state.files);
        if (state.currentFile?.id === fileId) {
          state.currentFile = null;
        }
      })
      .addCase(fetchTrashCount.fulfilled, (state, action) => {
        state.trashCount = action.payload;
      })
      .addCase(emptyTrash.fulfilled, (state) => {
        state.trashCount = 0;
      });
  },
});

export const { setCurrentFile, clearCurrentProject, updateFileInTree } = projectSlice.actions;
export default projectSlice.reducer;
