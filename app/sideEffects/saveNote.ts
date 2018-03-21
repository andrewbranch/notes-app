import { Store } from 'react-redux';
import { convertToRaw } from 'draft-js';
import { debounce } from 'lodash';
import { StateShape } from '../reducers';
import { selectedNoteSelector, noteIdsSelector } from '../selectors/notes.selectors';
import { updateNoteIPC } from '../../interprocess/ipcDefinitions';

export const saveNote = debounce((state: StateShape, prevState: StateShape) => {
  (window as any).requestIdleCallback(() => {
    if (!noteIdsSelector(prevState).length || !noteIdsSelector(state).length) {
      return;
    }

    const prevSelectedNote = selectedNoteSelector(prevState);
    const selectedNote = selectedNoteSelector(state);
    if (selectedNote && prevSelectedNote && prevSelectedNote !== selectedNote) {
      if (selectedNote.id === prevSelectedNote.id && selectedNote !== prevSelectedNote) {
        const { editor } = selectedNote;
        const content = editor.getCurrentContent();
        const prevContent = prevSelectedNote.editor.getCurrentContent();
        const patch = {
          ...(content !== prevContent ? { content: convertToRaw(content) } : {})
        };

        if (Object.keys(patch).length) {
          updateNoteIPC.send({ id: selectedNote.id, patch });
        }
      }
    }
  });
}, 500);
