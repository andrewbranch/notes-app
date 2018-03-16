import { EditorState } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { decorators } from './decorators';
import { updateInlineStyles } from './steps/updateInlineStyles';
import { styleValues } from './styles';
import { collapseInlineStyles } from './steps/collapseInlineStyle';
import { expandInlineStyle } from './steps/expandInlineStyle';

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  onChange: editorState => {
    const prevEditorState = getEditorState();
    const editorStateWithNewStyles = updateInlineStyles(editorState, prevEditorState);
    const editorStateWithCollapsedStyles = collapseInlineStyles(editorStateWithNewStyles);
    const editorStateWithExpandedStyles = expandInlineStyle(editorStateWithCollapsedStyles);
    return editorStateWithExpandedStyles;
  },

  decorators,

  customStyleMap: styleValues.reduce((map, style) => ({
    ...map,
    [style.name]: style.styleAttributes
  }), {})
});