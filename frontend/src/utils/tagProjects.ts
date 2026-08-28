const PROJECT_TAGS_KEY = 'texflow-project-tags';

export type ProjectTagMap = Record<string, string[]>; // projectId -> tag names[]

function loadProjectTags(): ProjectTagMap {
  try {
    const raw = localStorage.getItem(PROJECT_TAGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProjectTags(map: ProjectTagMap) {
  localStorage.setItem(PROJECT_TAGS_KEY, JSON.stringify(map));
}

/** Get all tags assigned to a project */
export function getProjectTags(projectId: string): string[] {
  const map = loadProjectTags();
  return map[projectId] || [];
}

/** Get all project IDs that have a specific tag */
export function getProjectIdsByTag(tagName: string): string[] {
  const map = loadProjectTags();
  const lower = tagName.toLowerCase();
  return Object.entries(map)
    .filter(([, tags]) => tags.some(t => t.toLowerCase() === lower))
    .map(([id]) => id);
}

/** Get count of projects with a specific tag */
export function getTagProjectCount(tagName: string): number {
  return getProjectIdsByTag(tagName).length;
}

/** Get count of projects with NO tags */
export function getUncategorizedCount(allProjectIds: string[]): number {
  const map = loadProjectTags();
  return allProjectIds.filter(id => !map[id] || map[id].length === 0).length;
}

/** Check if a project has no tags */
export function isUncategorized(projectId: string): boolean {
  const map = loadProjectTags();
  return !map[projectId] || map[projectId].length === 0;
}

/** Assign a tag to a project */
export function addTagToProject(projectId: string, tagName: string) {
  const map = loadProjectTags();
  const existing = map[projectId] || [];
  if (existing.some(t => t.toLowerCase() === tagName.toLowerCase())) return;
  map[projectId] = [...existing, tagName];
  saveProjectTags(map);
}

/** Remove a tag from a project */
export function removeTagFromProject(projectId: string, tagName: string) {
  const map = loadProjectTags();
  const existing = map[projectId] || [];
  map[projectId] = existing.filter(t => t.toLowerCase() !== tagName.toLowerCase());
  if (map[projectId].length === 0) delete map[projectId];
  saveProjectTags(map);
}

/** Set all tags for a project (replaces existing) */
export function setProjectTags(projectId: string, tagNames: string[]) {
  const map = loadProjectTags();
  if (tagNames.length === 0) {
    delete map[projectId];
  } else {
    map[projectId] = tagNames;
  }
  saveProjectTags(map);
}

/** Get the full project-tag map */
export function getAllProjectTags(): ProjectTagMap {
  return loadProjectTags();
}
