import { createSelector } from 'reselect';
import { selectedNoteSelector } from '../../selectors/notes.selectors';
import { Note } from '../../reducers/notes';

export const editorSelector = createSelector(
  selectedNoteSelector,
  ({ id, title, editor }: Note) => ({ noteId: id, title, editor })
);