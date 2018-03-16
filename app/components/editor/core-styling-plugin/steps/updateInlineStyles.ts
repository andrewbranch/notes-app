import { EditorState } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { values } from 'lodash';
import { stripStylesFromBlock, performUnUndoableEdits, getContiguousStyleRangesNearSelectionEdges, EditorChangeType, getDeletedCharactersFromChange, getInsertedCharactersFromChange, getAdjacentCharacters } from '../../../../utils/draft-utils';
import { styles, styleValues, isCoreStyle, TRIGGER_CHARACTERS } from '../styles';

const shouldReprocessInlineStyles = (changeType: EditorChangeType, oldEditorState: EditorState, newEditorState: EditorState): boolean => {
  const newContent = newEditorState.getCurrentContent();
  const newSelection = newEditorState.getSelection();
  const oldSelection = oldEditorState.getSelection();
  const oldContent = oldEditorState.getCurrentContent();
  switch (changeType) {
    case 'backspace-character':
    case 'delete-character':
    case 'remove-range':
    case 'insert-characters':
      const deletedCharacters = getDeletedCharactersFromChange(changeType, oldEditorState, newEditorState);
      const insertedCharacters = getInsertedCharactersFromChange(changeType, oldEditorState, newEditorState);
      const adjacentCharacters = getAdjacentCharacters(oldContent, oldSelection);
      return TRIGGER_CHARACTERS.some(c => (
        insertedCharacters.includes(c)
        || deletedCharacters.includes(c)
        || adjacentCharacters.indexOf(c) > -1)
      );

    case 'split-block':
      const startBlock = oldContent.getBlockForKey(oldSelection.getStartKey());
      const startSplitStyle = startBlock.getInlineStyleAt(oldSelection.getStartOffset());
      if (startSplitStyle.some(style => style!.startsWith('core.styling'))) {
        return true;
      }
      const endBlock = newContent.getBlockForKey(newSelection.getStartKey());
      const endSplitStyle = endBlock.getInlineStyleAt(newSelection.getStartOffset());
      if (endSplitStyle.some(style => style!.startsWith('core.styling'))) {
        return true;
      }
      return false;

    default:
      return true;
  }
};

export const updateInlineStyles = (editorState: EditorState, prevEditorState: EditorState): EditorState => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();

  const changeType = editorState.getLastChangeType();
  const prevContent = prevEditorState.getCurrentContent();
  const prevSelection = prevEditorState.getSelection();
  const focusKey = selection.getFocusKey();
  
  if (prevContent !== content && shouldReprocessInlineStyles(changeType, prevEditorState, editorState)) {
    const affectedBlocks = changeType === 'split-block' ?  [prevSelection.getStartKey(), focusKey] : [focusKey];
    let nextContent = content;

    affectedBlocks.forEach(blockKey => {
      getContiguousStyleRangesNearSelectionEdges(
        nextContent,
        selection,
        isCoreStyle
      ).forEach((ranges, key) => {
        nextContent = stripStylesFromBlock(
          nextContent,
          blockKey,
          styleName => styleName === key,
          ranges![0][1], // selection must be collapsed in this method
          ranges![0][2]  //
        );
      });

      const newText = nextContent.getBlockForKey(blockKey).getText();

      // Go through each styling entity and reapply
      styleValues.forEach(style => {
        let matchArr;
        style.pattern.lastIndex = 0;
        do {
          matchArr = style.pattern.exec(newText);
          if (matchArr) {
            nextContent = style.applyStyle(nextContent, blockKey, matchArr.index, matchArr.index + matchArr[0].length);
          }
        } while (matchArr);
      });
    });

    return performUnUndoableEdits(editorState, disabledUndoEditorState => {
      return EditorState.forceSelection(
        EditorState.push(disabledUndoEditorState, nextContent, 'change-inline-style'),
        selection
      );
    });
  }

  return editorState;
};
