import { Reducer } from 'redux';
import { EditorState } from 'draft-js';
import { updateEditor } from '../components/editor/Editor.actions';
import { NotesState } from './types';
import { loadNotes } from '../actions/ipc';
import { createNoteActionCreator } from '../actions/notes';
import { emptyContentState } from '../../interprocess/seed';
import { deleteNote } from '../components/Shell.actions';

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
        editor: action.payload.editorState,
        updatedAt: note.editor && note.editor.getCurrentContent() !== action.payload.editorState.getCurrentContent()
          ? action.payload.time
          : note.updatedAt
      }
    };
  }

  if (createNoteActionCreator.test(action)) {
    return {
      ...state,
      [action.payload.id]: {
        ...action.payload,
        content: emptyContentState,
        editor: EditorState.createEmpty(),
        isDeleted: false
      }
    };
  }

  if (deleteNote.test(action)) {
    return {
      ...state,
      [action.payload]: {
        ...state[action.payload],
        isDeleted: true
      }
    };
  }

  return state;
}