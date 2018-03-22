import { EditorState } from 'draft-js';
import { createActionCreator } from '../../actions/helpers';

export const updateEditor = createActionCreator<{ noteId: string, editorState: EditorState, time: number }>('editor.update');