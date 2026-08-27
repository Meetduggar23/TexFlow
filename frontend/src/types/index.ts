export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  parentId: string | null;
  mimeType?: string;
  size?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  compiler?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  owner?: User;
  collaborators?: Collaborator[];
  files?: ProjectFile[];
  _count?: { files: number };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  content: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  id: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
}

export interface CompileResult {
  success: boolean;
  pdfUrl?: string;
  errors?: CompileError[];
  warnings?: CompileError[];
  logs?: string;
}

export interface CompileError {
  line: number;
  column: number;
  message: string;
  file?: string;
}

export interface CursorPosition {
  userId: string;
  name: string;
  color: string;
  line: number;
  column: number;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  resolved: boolean;
  user: User;
  replies: CommentReply[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  user: User;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  projectId?: string;
  read: boolean;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  author: string;
  content: string;
}

export interface DocumentVersion {
  id: string;
  projectId: string;
  userId: string;
  label?: string;
  snapshot: string;
  user: User;
  createdAt: string;
}
