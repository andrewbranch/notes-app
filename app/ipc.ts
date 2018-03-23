import { Store } from 'react-redux';
import { loadNotes } from './actions/ipc';
import { StateShape } from './reducers/types';
import { fetchNotesIPC } from '../interprocess/ipcDefinitions';

export const initIPC = (store: Store<StateShape>) => {
  fetchNotesIPC.send().then(notes => {
    store.dispatch(loadNotes(notes!));
  });
};
