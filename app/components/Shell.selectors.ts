import { createSelector } from 'reselect';
import { selectedNoteSelector } from '../selectors/routing.selectors';

export default createSelector(
  selectedNoteSelector,
  (selectedNote) => ({ selectedNote })
);
