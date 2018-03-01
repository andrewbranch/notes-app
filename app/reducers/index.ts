import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { notesReducer as notes } from './notes';
import { StateShape } from './types';

const rootReducer = combineReducers<StateShape>({
  routing,
  notes
});

export { StateShape };
export default rootReducer;
