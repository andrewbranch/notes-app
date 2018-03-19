import { Store } from 'react-redux';
import { StateShape } from '../reducers';
import { selectedNoteSelector } from '../selectors/notes.selectors';
import { convertToRaw } from 'draft-js';
import { ipcRenderer } from 'electron';
import { debounce } from 'lodash';

export const saveNote = debounce((state: StateShape, prevState: StateShape) => {
  (window as any).requestIdleCallback(() => {
    const prevSelectedNote = selectedNoteSelector(prevState);
    const selectedNote = selectedNoteSelector(state);
    if (selectedNote && prevSelectedNote && prevSelectedNote !== selectedNote) {
      if (selectedNote.id === prevSelectedNote.id && selectedNote !== prevSelectedNote) {
        const { title, editor } = selectedNote;
        const content = editor.getCurrentContent();
        const prevContent = prevSelectedNote.editor.getCurrentContent();
        const patch = {
          ...(title !== prevSelectedNote.title ? { title } : {}),
          ...(content !== prevContent ? { content: convertToRaw(content) } : {})
        };

        if (Object.keys(patch).length) {
          ipcRenderer.send('saveNote', selectedNote.id, patch);
        }
      }
    }
  });
}, 500);
