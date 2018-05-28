import { Plugin } from 'draft-js-plugins-editor';
import { EditorState } from 'draft-js';
import { addEntities } from './steps/addEntities';
import { linkDecorator } from './decorators/link';
import { removeEntities } from './steps/removeAndUpdateEntities';
import { collapseEntities } from './steps/collapseEntities';

export const createCoreEntityPlugin = (getEditorState: () => EditorState): Plugin => ({
  onChange: editorState => {
    const prevEditorState = getEditorState();
    return collapseEntities(addEntities(removeEntities(editorState, prevEditorState), prevEditorState), prevEditorState);
  },

  decorators: [linkDecorator]
});