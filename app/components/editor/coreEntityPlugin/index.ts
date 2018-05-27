import { Plugin } from 'draft-js-plugins-editor';
import { EditorState } from 'draft-js';
import { addEntities } from './steps/addEntities';
import { linkDecorator } from './decorators/link';

export const createCoreEntityPlugin = (getEditorState: () => EditorState): Plugin => ({
  onChange: editorState => {
    const prevEditorState = getEditorState();
    return addEntities(editorState, prevEditorState); 
  },

  decorators: [linkDecorator]
});