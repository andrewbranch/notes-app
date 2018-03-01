import { createSelector } from 'reselect';
import { StateShape } from '../reducers';

export const notesSelector = (state: StateShape) => state.notes;
export const noteIdsSelector = createSelector(notesSelector, notes => Object.keys(notes));
