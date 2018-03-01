import { StoreShape } from '../reducers';

export const locationSelector = (state: StoreShape) => state.routing.location;