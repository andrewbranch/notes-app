import { StateShape } from '../reducers';
import { createSelector } from 'reselect';

export const dataTranferSelector = (state: StateShape) => state.dataTransfer;
export const loadedNotesStatusSelector = createSelector(dataTranferSelector, dataTransfer => dataTransfer.loadedNotesStatus);