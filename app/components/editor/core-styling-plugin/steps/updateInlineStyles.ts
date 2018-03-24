import { EditorState, Modifier } from 'draft-js';
import { constant } from 'lodash';
import { Map, is } from 'immutable';
import { stripStylesFromBlock, performUnUndoableEdits, EditorChangeType, getDeletedCharactersFromChange, getInsertedCharactersFromChange, getAdjacentCharacters, getContiguousStyleRangesNearOffset, Range, createSelectionWithRange, getContiguousStyleRangesAtOffset } from '../../../../utils/draft-utils';
import { expandableStyles, expandableStyleValues, isExpandableStyle, TRIGGER_CHARACTERS, CoreExpandableStyleName } from '../styles';

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
        isExpandableStyle
      ).forEach((range, key) => {
        nextContent = stripStylesFromBlock(
          nextContent,
          position.block,
          styleName => styleName === key || styleName === 'core.styling.decorator',
          range!.start,
          range!.end
        );
      });

      const newText = nextContent.getBlockForKey(position.block).getText();

      // Go through each styling entity and reapply
      expandableStyleValues.forEach(style => {
        let matchIndex = -1;
        let lastValidMatch: { index: number; styleRanges: Map<string, Range> } | undefined;
        while ((matchIndex = newText.indexOf(style.pattern, matchIndex + 1)) > -1) {
          const nextCharacter = newText.slice(matchIndex + style.pattern.length, matchIndex + style.pattern.length + 1) || null;
          if (nextCharacter && style.pattern.includes(nextCharacter)) {
            continue;
          }

          const block = nextContent.getBlockForKey(position.block);
          const match = {
            index: matchIndex,
            styleRanges: getContiguousStyleRangesAtOffset(block, matchIndex, isExpandableStyle)
          };

          if (
            lastValidMatch &&
            is(lastValidMatch.styleRanges, match.styleRanges) &&
            match.styleRanges.every((_, styleKey: CoreExpandableStyleName) => expandableStyles[styleKey].allowsNesting)
          ) {
            const start = lastValidMatch.index;
            const end = match.index + style.pattern.length;
            if (!style.allowsNesting) {
              nextContent = stripStylesFromBlock(nextContent, block, constant(true), start, end);
            }
            
            const styleSelection = createSelectionWithRange(block, start, end);
            const decoratorSelection = [
              createSelectionWithRange(block, start, start + style.pattern.length),
              createSelectionWithRange(block, end - style.pattern.length, end)
            ];
            nextContent = Modifier.applyInlineStyle(nextContent, styleSelection, style.name);
            nextContent = decoratorSelection.reduce(
              (content, selection) => Modifier.applyInlineStyle(content, selection, 'core.styling.decorator'),
              nextContent
            );
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
