import { createSelector } from 'reselect';
import { sortedNoteIdsSelector, selectedNoteSelector } from '../selectors/notes.selectors';
import { showEditorDebuggerSelector } from '../selectors/window.selectors';
import { loadedNotesStatusSelector } from '../selectors/dataTransfer.selectors';

export const shellSelector = createSelector(
  selectedNoteSelector,
  sortedNoteIdsSelector,
  showEditorDebuggerSelector,
  loadedNotesStatusSelector,
  (selectedNote, noteIds, showEditorDebugger, loadedNotesStatus) => ({ selectedNote, noteIds, showEditorDebugger, loadedNotesStatus })
);
