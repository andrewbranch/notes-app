import { ipcRenderer, IpcMessageEvent } from 'electron';
import { loadNotes } from './actions/ipc';
import { RawNote, StateShape } from './reducers/types';
import { Store } from 'react-redux';

export const initIPC = (store: Store<StateShape>) => {
  ipcRenderer.addListener('loadNotes', (event: IpcMessageEvent, notes: { [key: string]: RawNote }) => {
    store.dispatch(loadNotes(notes));
  });

  ipcRenderer.send('getNotes');
};
