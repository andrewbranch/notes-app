import { Reducer } from 'redux';
import { DataTransferStatus } from './types';
import { loadNotes } from '../actions/ipc';

export interface DataTransferState {
  loadedNotesStatus: DataTransferStatus;
}

const initialState: DataTransferState = {
  loadedNotesStatus: 'pending'
};

export const dataTransferReducer: Reducer<DataTransferState> = (state = initialState, action) => {
  if (loadNotes.test(action)) {
    return {
      loadedNotesStatus: 'complete'
    };
  }

  return state;
}