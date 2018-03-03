import { createSelector } from 'reselect';
import { StateShape } from '../reducers';

export const routingSelector = (state: StateShape) => state.routing;
export const locationSelector = createSelector(routingSelector, routing => routing.location);
export const selectedNoteIdSelector = createSelector(locationSelector, location => location!.pathname.substring(1));
