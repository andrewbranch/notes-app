import { difference } from 'lodash';
import { StateShape } from '../reducers';
import { noteIdsSelector } from '../selectors/notes.selectors';
import { ipcRenderer } from 'electron';

export const createNote = (state: StateShape, prevState: StateShape) => {
  (window as any).requestIdleCallback(() => {
    const noteIds = noteIdsSelector(state);
    const prevNoteIds = noteIdsSelector(prevState);
    if (noteIds !== prevNoteIds) {
      // It’s almost definitely only one, but doesn’t hurt to iterate over the difference
      difference(noteIds, prevNoteIds).forEach(newNoteId => {
        ipcRenderer.send('createNote', newNoteId);
      });
    }
  });
};
