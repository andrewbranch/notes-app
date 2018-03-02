import { createSelector } from 'reselect';
import { StateShape } from '../reducers';

export const locationSelector = (state: StateShape) => state.routing.location;
export const selectedNoteIdSelector = createSelector(locationSelector, location => location!.pathname.substring(1));
