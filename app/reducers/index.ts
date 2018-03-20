import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { notesReducer as notes } from './notes';
import { windowReducer as window } from './window';
import { dataTransferReducer as dataTransfer } from './dataTransfer';
import { StateShape } from './types';

const rootReducer = combineReducers<StateShape>({
  routing,
  notes,
  window,
  dataTransfer
});

export { StateShape };
export default rootReducer;
