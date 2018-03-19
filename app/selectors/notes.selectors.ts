import { createSelector } from 'reselect';
import { EditorState, convertFromRaw } from 'draft-js';
import { StateShape } from '../reducers';
import { selectedNoteIdSelector } from './routing.selectors';
import { NotesState, Note } from '../reducers/types';

export const notesSelector = (state: StateShape) => state.notes;
export const noteIdsSelector = createSelector(notesSelector, notes => Object.keys(notes));
export const selectedNoteSelector = createSelector(
  notesSelector,
  selectedNoteIdSelector,
  (notes, selectedNoteId) => {
    const note = selectedNoteId ? notes[selectedNoteId] : null;
    if (note && !note.editor) {
      return {
        ...note,
        editor: EditorState.createWithContent(convertFromRaw(note.content))
      } as Note;
    }

    return note as Note | null;
  }
);
