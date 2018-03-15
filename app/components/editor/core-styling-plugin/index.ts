import { EditorState } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { decorators } from './decorators';
import { updateInlineStyles } from './steps/updateInlineStyles';
import { styleValues } from './styles';

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  onChange: editorState => {
    const prevEditorState = getEditorState();
    const editorStateWithNewStyles = updateInlineStyles(editorState, prevEditorState);
    return editorStateWithNewStyles;
  },

  decorators,

  customStyleMap: styleValues.reduce((map, style) => ({
    ...map,
    [style.name]: style.styleAttributes
  }), {})
});