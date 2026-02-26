# Simple CMS Starter Templates

src/components/v-table.vue

- isTreeViewAble() no longer requires sortIsManual — tree structure (indent + collapse) always renders
  when parentField is configured
- watch(() => treeViewAble.value, initTreeView, { immediate: true }) — fires on mount so the tree  
  initializes even when all conditions are met from the start (was the root cause of the intermittent  
  reload issue)

src/components/table-row.vue

- Drag handle: v-if="showManualSort && sortedManually" — hidden when manual sort is toggled off

src/index.ts

- defaultSort only uses sortField (no primaryKeyField fallback) — first visit correctly defaults to
  manual sort
- Two watchers: one restores sort on first visit (when layoutQuery.sort is null), one restores after a
  filter is cleared
- onSortChange(null) saves [] — explicit toggle-off persists across sessions
