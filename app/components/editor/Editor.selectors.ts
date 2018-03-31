import { createSelector } from 'reselect';
import { selectedNoteSelector } from '../../selectors/notes.selectors';
import { Note } from '../../reducers/types';

export const editorSelector = createSelector(
  selectedNoteSelector,
  ({ id, editor }: Note) => ({ noteId: id, editor })
);