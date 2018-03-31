import { Plugin } from 'draft-js-plugins-editor';
import { EditorState } from 'draft-js';
import { convertBlockType } from './steps/convertBlockType';

export const createCoreBlockPlugin = (getEditorState: () => EditorState): Plugin => ({
  onChange: editorState => {
    const prevEditorState = getEditorState();
    return convertBlockType(editorState, prevEditorState);
  }
});
