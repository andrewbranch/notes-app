import { createSelector } from 'reselect';
import { selectedNoteIdSelector } from '../selectors/routing.selectors';
import { noteIdsSelector } from '../selectors/notes.selectors';

export const shellSelector = createSelector(
  selectedNoteIdSelector,
  noteIdsSelector,
  (selectedNote, noteIds) => ({ selectedNote, noteIds })
);
