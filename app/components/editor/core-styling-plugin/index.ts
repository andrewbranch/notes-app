import { EditorState, Modifier } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { decorators } from './decorators';
import { updateInlineStyles } from './steps/updateInlineStyles';
import { styleValues } from './styles';
import { collapseInlineStyles } from './steps/collapseInlineStyle';
import { expandInlineStyle } from './steps/expandInlineStyle';
import { createSelectionWithRange, createSelectionWithSelection, performUnUndoableEdits, performDependentEdits } from '../../../utils/draft-utils';

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  handleBeforeInput: (chars, editorState, { setEditorState }) => {
    const selection = editorState.getSelection();
    // Reset inline style in new blocks
    if (
      selection.getStartOffset() === 0 &&
      !editorState.getInlineStyleOverride() &&
      !editorState.getCurrentInlineStyle().isEmpty()
    ) {
      const newSelection = createSelectionWithRange(selection.getStartKey(), 0, 0);
      setEditorState(EditorState.forceSelection(
        EditorState.push(
          editorState,
          Modifier.insertText(editorState.getCurrentContent(), newSelection, chars),
          'insert-characters'
        ),
        createSelectionWithSelection(newSelection, chars.length, chars.length)
      ));

      return 'handled';
    }

    return 'not-handled';
  },

  onChange: editorState => {
    const prevEditorState = getEditorState();
    const editorStateWithNewStyles = updateInlineStyles(editorState, prevEditorState);
    const collapseEdits = collapseInlineStyles(editorStateWithNewStyles);
    const expandEdits = expandInlineStyle(editorStateWithNewStyles);
    return performDependentEdits(editorStateWithNewStyles, [...collapseEdits, ...expandEdits]);
  },

  decorators,

  customStyleMap: styleValues.reduce((map, style) => ({
    ...map,
    [style.name]: style.styleAttributes
  }), {})
});