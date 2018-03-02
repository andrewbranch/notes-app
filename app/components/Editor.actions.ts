import { EditorState } from 'draft-js';
import { actionCreator } from '../actions/types';

export const updateEditor = actionCreator<{ noteId: string, editorState: EditorState }>('editor.update');