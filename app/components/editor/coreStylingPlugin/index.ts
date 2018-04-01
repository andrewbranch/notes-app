import { EditorState, Modifier } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { decorators } from './decorators';
import { removeInlineStyles } from './steps/removeInlineStyles';
import { addInlineStyles } from './steps/addInlineStyles';
import { collapseInlineStyles } from './steps/collapseInlineStyles';
import { expandInlineStyle } from './steps/expandInlineStyles';
import { styleValues } from './styles';
import { createSelectionWithSelection, performDependentEdits } from '../../../utils/draftUtils';

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  handleBeforeInput: (chars, editorState, { setEditorState }) => {
    const selection = editorState.getSelection();
    // Reset inline style in new blocks
    if (
      selection.getStartOffset() === 0 &&
      !editorState.getInlineStyleOverride() &&
      !editorState.getCurrentInlineStyle().isEmpty()
    ) {
      if (selection.isCollapsed()) {
        setEditorState(EditorState.forceSelection(
          EditorState.push(
            editorState,
            Modifier.insertText(editorState.getCurrentContent(), selection, chars),
            'insert-characters'
          ),
          createSelectionWithSelection(selection, chars.length, chars.length)
        ));
      } else {
        setEditorState(EditorState.forceSelection(
          EditorState.push(
            editorState,
            Modifier.replaceText(editorState.getCurrentContent(), selection, chars),
            'insert-characters'
          ),
          createSelectionWithSelection(selection, chars.length, chars.length)
        ));
      }

      return 'handled';
    }

    return 'not-handled';
  },

  onChange: editorState => {
    const prevEditorState = getEditorState();
    const editorStateWithRemovedStyles = removeInlineStyles(editorState, prevEditorState);
    const editorStateWithAddedStyles = addInlineStyles(editorStateWithRemovedStyles, prevEditorState);
    const collapseEdits = collapseInlineStyles(editorStateWithAddedStyles, prevEditorState);
    const expandEdits = expandInlineStyle(editorStateWithAddedStyles);
    return performDependentEdits(editorStateWithAddedStyles, [...collapseEdits, ...expandEdits]);
  },

  decorators,

  customStyleMap: styleValues.reduce((map, style) => ({
    ...map,
    [style.name]: style.styleAttributes
  }), {})
});