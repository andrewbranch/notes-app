import { Reducer } from 'redux';
import { updateEditor } from '../components/editor/Editor.actions';
import { NotesState } from './types';
import { loadNotes } from '../actions/ipc';

const initialState: NotesState = {};

export const notesReducer: Reducer<NotesState> = (state = initialState, action) => {
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

  if (loadNotes.test(action)) {
    return action.payload;
  }

  return state;
}