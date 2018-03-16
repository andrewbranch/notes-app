import { EditorState } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { decorators } from './decorators';
import { updateInlineStyles } from './steps/updateInlineStyles';
import { styleValues } from './styles';
import { collapseInlineStyles } from './steps/collapseInlineStyle';

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  onChange: editorState => {
    const prevEditorState = getEditorState();
    const editorStateWithNewStyles = updateInlineStyles(editorState, prevEditorState);
    const editorStateWithCollapsedStyles = collapseInlineStyles(editorStateWithNewStyles);
    return editorStateWithCollapsedStyles;
  },

  decorators,

  customStyleMap: styleValues.reduce((map, style) => ({
    ...map,
    [style.name]: style.styleAttributes
  }), {})
});