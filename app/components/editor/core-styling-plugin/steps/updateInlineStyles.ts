import { EditorState } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { values, constant } from 'lodash';
import { OrderedSet, Map, is } from 'immutable';
import { stripStylesFromBlock, performUnUndoableEdits, getContiguousStyleRangesNearSelectionEdges, EditorChangeType, getDeletedCharactersFromChange, getInsertedCharactersFromChange, getAdjacentCharacters, getContiguousStyleRangesNearOffset, Range } from '../../../../utils/draft-utils';
import { styles, styleValues, isCoreStyle, TRIGGER_CHARACTERS, CoreInlineStyleName } from '../styles';

const shouldReprocessInlineStyles = (changeType: EditorChangeType, oldEditorState: EditorState, newEditorState: EditorState): boolean => {
  const newContent = newEditorState.getCurrentContent();
  const newSelection = newEditorState.getSelection();
  const oldSelection = oldEditorState.getSelection();
  const oldContent = oldEditorState.getCurrentContent();
  if (oldContent === newContent) {
    return false;
  }

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
  
  if (shouldReprocessInlineStyles(changeType, prevEditorState, editorState)) {
    const affectedPositions = changeType === 'split-block'
      ? [{ block: focusKey, offset: selection.getStartOffset() }, { block: prevSelection.getStartKey(), offset: prevSelection.getStartOffset() }]
      : [{ block: focusKey, offset: selection.getStartOffset() }];
    let nextContent = content;

    affectedPositions.forEach(position => {
      getContiguousStyleRangesNearOffset(
        nextContent.getBlockForKey(position.block),
        position.offset,
        isCoreStyle
      ).forEach((range, key) => {
        nextContent = stripStylesFromBlock(
          nextContent,
          position.block,
          styleName => styleName === key,
          range!.start,
          range!.end
        );
      });

      const newText = nextContent.getBlockForKey(position.block).getText();

      // Go through each styling entity and reapply
      styleValues.forEach(style => {
        let matchIndex = -1;
        let lastValidMatch: { index: number; styleRanges: Map<string, Range> } | undefined;
        while ((matchIndex = newText.indexOf(style.pattern, matchIndex + 1)) > -1) {
          const block = nextContent.getBlockForKey(position.block);
          const match = {
            index: matchIndex,
            styleRanges: getContiguousStyleRangesNearOffset(block, matchIndex, isCoreStyle)
          };

          if (
            lastValidMatch &&
            is(lastValidMatch.styleRanges, match.styleRanges) &&
            match.styleRanges.every((_, styleKey: CoreInlineStyleName) => styles[styleKey].allowsNesting)
          ) {
            const start = lastValidMatch.index;
            const end = match.index + style.pattern.length;
            if (!style.allowsNesting) {
              nextContent = stripStylesFromBlock(nextContent, block, constant(true), start, end);
            }
            nextContent = style.applyStyle(nextContent, block, start, end);
            lastValidMatch = undefined;
          } else {
            lastValidMatch = match;
          }
        }
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
