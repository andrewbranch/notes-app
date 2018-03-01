import { createSelector } from 'reselect';
import { selectedNoteSelector } from '../selectors/routing.selectors';
import { noteIdsSelector } from '../selectors/notes.selectors';

export const shellSelector = createSelector(
  selectedNoteSelector,
  noteIdsSelector,
  (selectedNote, noteIds) => ({ selectedNote, noteIds })
);
