import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Project, FileNode } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  files: FileNode[];
  currentFile: FileNode | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  files: [],
  currentFile: null,
  loading: false,
  error: null,
};

const API = '/api';

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
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
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return projectId;
  }
);

export const fetchFiles = createAsyncThunk(
  'project/fetchFiles',
  async (projectId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/files/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch files');
    const data = await response.json();
    return data.files || data;
  }
);

export const updateFileContent = createAsyncThunk(
  'project/updateFileContent',
  async ({ fileId, content }: { fileId: string; content: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/files/${fileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
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
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create file');
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
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete file');
    return fileId;
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
      if (state.currentFile?.id === fileId) {
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
      .addCase(fetchFiles.fulfilled, (state, action) => {
        const files = action.payload;
        if (Array.isArray(files)) {
          state.files = files.map((f: any) => ({
            id: f.id,
            name: f.name,
            type: (f.mimeType?.includes('folder') ? 'folder' : 'file') as 'file' | 'folder',
            content: f.content,
            parentId: f.folderId || null,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
          }));
        }
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
      });
  },
});

export const { setCurrentFile, clearCurrentProject, updateFileInTree } = projectSlice.actions;
export default projectSlice.reducer;
