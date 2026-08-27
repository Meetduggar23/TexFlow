import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  fileTreeExpanded: Record<string, boolean>;
}

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: true,
  fileTreeExpanded: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    toggleFileNode(state, action) {
      const nodeId = action.payload;
      state.fileTreeExpanded[nodeId] = !state.fileTreeExpanded[nodeId];
    },
    expandAll(state, action) {
      const nodes = action.payload;
      const expand = (nodeList: any[]) => {
        for (const node of nodeList) {
          if (node.type === 'folder') {
            state.fileTreeExpanded[node.id] = true;
            if (node.children) expand(node.children);
          }
        }
      };
      expand(nodes);
    },
    collapseAll(state) {
      state.fileTreeExpanded = {};
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleDarkMode, toggleFileNode, expandAll, collapseAll } = uiSlice.actions;
export default uiSlice.reducer;
