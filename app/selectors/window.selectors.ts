import { createSelector } from 'reselect';
import { StateShape } from '../reducers';

export const windowSelector = (state: StateShape) => state.window;
export const showEditorDebuggerSelector = createSelector(windowSelector, window => window.showEditorDebugger);