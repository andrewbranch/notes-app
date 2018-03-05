import { createSelector } from 'reselect';
import { StateShape } from '../reducers';
import { selectedNoteIdSelector } from './routing.selectors';

export const notesSelector = (state: StateShape) => state.notes;
export const noteIdsSelector = createSelector(notesSelector, notes => Object.keys(notes));
export const selectedNoteSelector = createSelector(
  notesSelector,
  selectedNoteIdSelector,
  (notes, selectedNoteId) => selectedNoteId ? notes[selectedNoteId] : null
);