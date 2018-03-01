import { combineReducers } from 'redux';
import { routerReducer as routing, RouterState } from 'react-router-redux';

export type StoreShape = {
  routing: RouterState;
};

const rootReducer = combineReducers<StoreShape>({
  routing
});

export default rootReducer;
