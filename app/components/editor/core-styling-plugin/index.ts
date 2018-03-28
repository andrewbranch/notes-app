import { EditorState, Modifier } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { decorators } from './decorators';
import { removeInlineStyles } from './steps/removeInlineStyle';
import { styleValues } from './styles';
import { collapseInlineStyles } from './steps/collapseInlineStyle';
import { expandInlineStyle } from './steps/expandInlineStyle';
import { createSelectionWithRange, createSelectionWithSelection, performDependentEdits } from '../../../utils/draft-utils';
import { addInlineStyles } from './steps/addInlineStyles';

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