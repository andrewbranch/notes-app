import { createSelector } from 'reselect';
import { StateShape } from '../reducers';

export const routingSelector = (state: StateShape) => state.routing;
export const locationSelector = createSelector(routingSelector, routing => routing.location);
export const selectedNoteIdSelector = createSelector(
  locationSelector,
  (state: StateShape) => state.notes,
  (location, notes) => {
    const noteId = location!.pathname.substring(1);
    return Object.keys(notes).includes(noteId) ? noteId : null;
  }
);
