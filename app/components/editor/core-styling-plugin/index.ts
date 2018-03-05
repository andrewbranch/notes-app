import { EditorState } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { Set } from 'immutable';
import { stripStylesFromBlock, performUnUndoableEdits, getContiguousStyleRangesNearCursor } from '../../../utils/draft-utils';
import { decorators } from './decorators';
import { shouldReprocessInlineStyles } from './shouldProcessChanges';
import { styles, isCoreStyle } from './styles';

const recreateStylesInBlocks = (editorState: EditorState, affectedBlocks: string[] = [editorState.getSelection().getStartKey()]): EditorState => {
  let contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();

  // Because a single character change could change several entites in a block,
  // easiest thing to do is to delete them all and recreate them all.
  // This probably isn’t the most efficient thing, so we might need to
  // revisit this logic later if performance suffers.
  affectedBlocks.forEach(blockKey => {
    contentState = stripStylesFromBlock(
      contentState,
      blockKey,
      styleName => styleName.startsWith('core.styling')
    );

    const newText = contentState.getBlockForKey(blockKey).getText();

    // Go through each styling entity and reapply
    styles.forEach(style => {
      let matchArr;
      do {
        matchArr = style.pattern.exec(newText);
        if (matchArr) {
          contentState = style.applyStyle(contentState, blockKey, matchArr.index, matchArr.index + matchArr[0].length);
        }
      } while (matchArr);
    });
  });

  return performUnUndoableEdits(editorState, disabledUndoEditorState => {
    return EditorState.forceSelection(
      EditorState.push(disabledUndoEditorState, contentState, 'change-inline-style'),
      selection
    );
  });
};

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  onChange: editorState => {
    const changeType = editorState.getLastChangeType();
    const oldEditorState = getEditorState();
    const oldContent = oldEditorState.getCurrentContent();
    const oldSelection = oldEditorState.getSelection();
    const newSelection = editorState.getSelection();
    const newFocusKey = newSelection.getFocusKey();
    let newContent = editorState.getCurrentContent();
    
    let newEditorState = editorState;
    if (oldContent !== newContent && shouldReprocessInlineStyles(changeType, oldEditorState, editorState)) {
      switch (changeType) {
        case 'delete-character':
        case 'remove-range':
        case 'backspace-character':
          newEditorState = recreateStylesInBlocks(editorState);
          break;
        case 'split-block':
          newEditorState = recreateStylesInBlocks(editorState, [
            oldSelection.getStartKey(),
            newFocusKey
          ]);
          break;
        case 'insert-characters':
          newEditorState = recreateStylesInBlocks(editorState);
          break;
      }
    }

    newContent = newEditorState.getCurrentContent();
    const oldStyleRangesInFocus = getContiguousStyleRangesNearCursor(
      oldContent.getBlockForKey(oldSelection.getFocusKey()),
      oldSelection.getFocusOffset(),
      isCoreStyle
    );
    
    const newStyleRangesInFocus = getContiguousStyleRangesNearCursor(
      newContent.getBlockForKey(newFocusKey),
      newSelection.getFocusOffset(),
      isCoreStyle
    );

    const oldStyleRangeKeys = Set(oldStyleRangesInFocus.keys());
    const newStyleRangeKeys = Set(newStyleRangesInFocus.keys());
    const rangesToExpand = newStyleRangeKeys.subtract(oldStyleRangeKeys);
    const rangesToCollapse = oldStyleRangeKeys.subtract(newStyleRangeKeys);
    rangesToExpand.forEach(style => console.log('EXPAND'));
    rangesToCollapse.forEach(style => console.log('COLLAPSE'));

    return newEditorState;
  },

  decorators,

  customStyleMap: styles.reduce((map, style) => ({
    ...map,
    [style.name]: style.styleAttributes
  }), {})
});