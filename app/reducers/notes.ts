import { Reducer } from 'redux';
import { updateEditor } from '../components/editor/Editor.actions';
import { NotesState } from './types';
import { loadNotes } from '../actions/ipc';
import { createNote, createNoteActionCreator } from '../actions/notes';
import { emptyContentState } from '../../main/seed';
import { EditorState } from 'draft-js';

const initialState: NotesState = {};

export const notesReducer: Reducer<NotesState> = (state = initialState, action) => {
  if (loadNotes.test(action)) {
    return action.payload;
  }

  if (updateEditor.test(action)) {
    const note = state[action.payload.noteId];
    return {
      ...state,
      [action.payload.noteId]: {
        ...note,
        editor: action.payload.editorState
      }
    };
  }

  if (createNoteActionCreator.test(action)) {
    return {
      ...state,
      [action.payload]: {
        id: action.payload,
        content: emptyContentState,
        editor: EditorState.createEmpty()
      }
    };
  }

  return state;
}