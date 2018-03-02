import { createSelector } from 'reselect';
import { selectedNoteSelector } from '../selectors/notes.selectors';

export const editorSelector = createSelector(
  selectedNoteSelector,
  ({ id, title, editor }) => ({ noteId: id, title, editor })
);