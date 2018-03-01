import { createSelector } from 'reselect';
import { StoreShape } from '../reducers';

export const locationSelector = (state: StoreShape) => state.routing.location;
export const selectedNoteSelector = createSelector(locationSelector, location => location!.pathname.substring(1));
