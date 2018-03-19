import { ipcRenderer, IpcMessageEvent } from 'electron';
import { loadNotes } from './actions/ipc';
import { LazyNote, StateShape } from './reducers/types';
import { Store } from 'react-redux';

export const initIPC = (store: Store<StateShape>) => {
  ipcRenderer.addListener('loadNotes', (event: IpcMessageEvent, notes: { [key: string]: LazyNote }) => {
    store.dispatch(loadNotes(notes));
  });

  ipcRenderer.send('getNotes');
};
