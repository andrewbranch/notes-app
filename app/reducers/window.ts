import { Reducer } from 'redux';
import { toggleEditorDebugger } from '../actions/window';

export interface WindowState {
  showEditorDebugger: boolean;
}

const initialState: WindowState = {
  showEditorDebugger: false
};

export const windowReducer: Reducer<WindowState> = (state = initialState, action) => {
  if (toggleEditorDebugger.test(action)) {
    return {
      ...state,
      showEditorDebugger: !state.showEditorDebugger
    };
  }

  return state;
}