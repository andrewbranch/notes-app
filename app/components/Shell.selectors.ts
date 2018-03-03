import { createSelector } from 'reselect';
import { noteIdsSelector, selectedNoteSelector } from '../selectors/notes.selectors';
import { showEditorDebuggerSelector } from '../selectors/window.selectors';

export const shellSelector = createSelector(
  selectedNoteSelector,
  noteIdsSelector,
  showEditorDebuggerSelector,
  (selectedNote, noteIds, showEditorDebugger) => ({ selectedNote, noteIds, showEditorDebugger })
);
