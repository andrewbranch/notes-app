import * as assert from 'assert';
import { EditorState, ContentState } from 'draft-js';
import { eq } from 'lodash/fp';
import { getContiguousStyleRangesAtOffset, stripStylesFromBlock, getDeletedCharactersFromChange, Range, performUnUndoableEdits } from '../../../../utils/draftUtils';
import { isExpandableStyle, CoreExpandableStyleName, isStyleDecorator, expandableStyles, isCoreStyle, getPatternRegExp } from '../styles';

const commit = (editorState: EditorState, newContent: ContentState): EditorState => {
  return performUnUndoableEdits(editorState, disabledUndoEditorState => {
    return EditorState.forceSelection(
      EditorState.push(disabledUndoEditorState, newContent, 'change-inline-style'),
      editorState.getSelection()
    );
  });
}

// For each decorator character deleted whose associated style range wasn’t fully deleted, remove that style range. (1)
// If the selection is now inside a style range that doesn’t pass that style’s RegExp test, remove that style.
// For each style range that was split into two blocks, remove that style range from each block
// contiguous to the split point. Finally, remove styles continued from the end of a style range.
// 
// (1) If the selection was not collapsed, get style ranges at previous selection start. Find each range’s end.
// If end is within previous selection, it was deleted, so remove that style. Get style ranges at previous selection end.
// Find each range’s start. If start is within previous selection, it was deleted, so remove that style. If the selection
// was collapsed, get the deleted character. If that was a decorator character, get the other contiguous style ranges
// applied to that character, and find which one shares a boundary with the start or end of the decorator style range.
// Remove that style.
export const removeInlineStyles = (editorState: EditorState, prevEditorState: EditorState): EditorState => {
  const content = editorState.getCurrentContent();
  const prevContent = prevEditorState.getCurrentContent();
  if (content === prevContent) {
    // Only the seleciton has changed, so there’s nothing to do.
    return editorState;
  }
  
  const selection = editorState.getSelection();
  if (!selection.isCollapsed()) {
    // The only way the selection could not be collapsed in this step is via an undo,
    // in which case I think there’s nothing to do.
    return editorState;
  }

  const changeType = editorState.getLastChangeType();
  const startKey = selection.getStartKey();
  const startOffset = selection.getStartOffset();
  const prevSelection = prevEditorState.getSelection();
  const prevStartKey = prevSelection.getStartKey();
  const prevEndKey = prevSelection.getEndKey();
  const prevStartOffset = prevSelection.getStartOffset();
  const prevEndOffset = prevSelection.getEndOffset();
  const [, deletedCharacters] = getDeletedCharactersFromChange(changeType, prevEditorState, editorState);
  let nextContent = content;

  if (changeType === 'split-block') {
    const prevUpperBlock = prevContent.getBlockForKey(prevStartKey);
    const upperBlock = content.getBlockForKey(prevStartKey);
    const upperBlockKey = prevStartKey;
    const lowerBlockKey = startKey;
    assert.equal(upperBlock.getLength(), prevStartOffset, 'Upper block length and prevStartOffset were different');

    getContiguousStyleRangesAtOffset(
      prevUpperBlock,
      prevStartOffset - 1,
      isExpandableStyle
    ).forEach((range, styleKey: CoreExpandableStyleName) => {
      // If the selection was at the very end of the range, there’s nothing we need to do
      if (range!.end === prevStartOffset) {
        return;
      }

      const decoratorPattern = expandableStyles[styleKey].pattern;
      // Remove the upper block’s cut off styles then the counterpart in the lower block
      nextContent = stripStylesFromBlock(nextContent, upperBlockKey, eq(styleKey), range!.start, prevStartOffset);
      nextContent = stripStylesFromBlock(nextContent, lowerBlockKey, eq(styleKey), 0, range!.end - prevEndOffset);

      // Remove the leading decorator’s styles from the upper then the trailing decorator’s styles from the lower
      // There’s a chance that range.start + decoratorPattern.length is too far, but it doesn’t matter because it extends into nothing
      nextContent = stripStylesFromBlock(nextContent, upperBlockKey, isStyleDecorator, range!.start, range!.start + decoratorPattern.length);
      nextContent = stripStylesFromBlock(nextContent, lowerBlockKey, isStyleDecorator, Math.max(0, range!.end - prevEndOffset - decoratorPattern.length), range!.end - prevEndOffset);

      // Remove the upper block’s trailing decorator’s style if it exists (can only happen with decorators of length > 1)
      // then the lower block’s leading decorator if it exists (same deal)
      if (decoratorPattern.length > 1) {
        if (range!.end - decoratorPattern.length < prevStartOffset) {
          nextContent = stripStylesFromBlock(nextContent, upperBlockKey, isStyleDecorator, range!.end - decoratorPattern.length, prevStartOffset);
        }
        if (prevEndOffset < range!.start + decoratorPattern.length) {
          nextContent = stripStylesFromBlock(nextContent, lowerBlockKey, isStyleDecorator, 0, range!.start + decoratorPattern.length - prevEndOffset);
        }
      }
    });
  } else if (!prevSelection.isCollapsed()) {
    // assert.equal(prevStartKey, selection.getStartKey(), 'New selection is not in the same block as the previous selection');
    
    // Handle style ranges whose end got broken off
    getContiguousStyleRangesAtOffset(
      prevContent.getBlockForKey(prevStartKey),
      prevStartOffset,
      isExpandableStyle
    ).forEach((range, styleKey: CoreExpandableStyleName) => {
      // If end of style range was within the selection but the start wasn’t
      if (range!.start < prevStartOffset && (prevEndKey !== prevStartKey || range!.end <= prevEndOffset)) {
        const decoratorPattern = expandableStyles[styleKey].pattern;
        // Remove expandable style
        nextContent = stripStylesFromBlock(nextContent, prevStartKey, eq(styleKey), range!.start, startOffset);
        // Remove that style’s leading decorator’s style
        nextContent = stripStylesFromBlock(nextContent, prevStartKey, isStyleDecorator, range!.start, range!.start + decoratorPattern.length);
        // Remove that style’s trailing decorator’s style if it exists (can only happen with decorators of length > 1)
        if (decoratorPattern.length > 1 && range!.end - decoratorPattern.length < prevStartOffset) {
          nextContent = stripStylesFromBlock(
            nextContent,
            prevStartKey,
            isStyleDecorator,
            range!.end - decoratorPattern.length,
            startOffset
          );
        }
      }
    });

    // Handle style ranges whose beginning got broken off
    getContiguousStyleRangesAtOffset(
      prevContent.getBlockForKey(prevEndKey),
      prevEndOffset,
      isExpandableStyle
    ).forEach((range, styleKey: CoreExpandableStyleName) => {
      // If start of style range was within the selection but the end wasn’t
      if (range!.end >= prevEndOffset && (prevStartKey !== prevEndKey || range!.start >= prevStartOffset)) {
        const decoratorPattern = expandableStyles[styleKey].pattern;
        // Remove expandable style
        const endCharacterOffset = startOffset + range!.end - prevEndOffset;
        nextContent = stripStylesFromBlock(nextContent, prevEndKey, eq(styleKey), startOffset, endCharacterOffset);
        // Remove that style’s decorator characters’ style
        nextContent = stripStylesFromBlock(nextContent, prevStartKey, isStyleDecorator, endCharacterOffset - decoratorPattern.length, endCharacterOffset);
        // Remove that style’s leading decorator’s style if it exists (can only happen with decorators of length > 1)
        if (prevEndOffset < range!.start + decoratorPattern.length) {
          nextContent = stripStylesFromBlock(
            nextContent,
            prevStartKey,
            isStyleDecorator,
            startOffset,
            range!.start + decoratorPattern.length - prevEndOffset
          );
        }
      }
    });
  } else {
    deletedCharacters.forEach(character => {
      // If the deleted character was a decorator character
      if (character!.getStyle().some(isStyleDecorator)) {
        const prevBlock = prevContent.getBlockForKey(prevStartKey);
        const styleRangesAtDeletedCharacter = getContiguousStyleRangesAtOffset(
          prevBlock,
          startOffset,
          isCoreStyle
        );

        const decoratorStyleRange = styleRangesAtDeletedCharacter.get('core.styling.decorator');
        assert.ok(decoratorStyleRange, 'Decorator style range was not in the map');
        // Find the expandable style range that shares a boundary with the decorator style range
        const styleRangesToRemove = styleRangesAtDeletedCharacter.filter(range => (
          range !== decoratorStyleRange &&
          (range!.start === decoratorStyleRange.start || range!.end === decoratorStyleRange.end)
        ));

        assert.ok(styleRangesToRemove.size, 'Deleted a decorator character but couldn’t find an expandable style to remove');
        assert.equal(styleRangesToRemove.size, 1, 'Deleted a decorator character and found more than one expandable style to remove');
        const [styleToRemove, range] = styleRangesToRemove.entrySeq().first() as [CoreExpandableStyleName, Range];
        const modifiedDecoratorIsTrailing = range.end === decoratorStyleRange.end;
        const style = expandableStyles[styleToRemove];
        // Remove that style.
        nextContent = stripStylesFromBlock(nextContent, prevStartKey, eq(styleToRemove), range.start, range.end - 1);
        // Remove that style’s decorator character styles.
        if (style.pattern.length > 1) {
          // Remove trailing decorator style
          nextContent = stripStylesFromBlock(
            nextContent,
            prevStartKey,
            isStyleDecorator,
            range.end - style.pattern.length - Number(!modifiedDecoratorIsTrailing),
            range.end - 1
          );

          // Remove leading decorator style
          nextContent = stripStylesFromBlock(
            nextContent,
            prevStartKey,
            isStyleDecorator,
            range.start,
            range.start + style.pattern.length - Number(!modifiedDecoratorIsTrailing)
          );
        }
      }
    });
  }

  // If either of the first two methods resulted in changes, we’re done here
  if (nextContent !== content) {
    return commit(editorState, nextContent);
  }

  // If the selection is fully inside a style range that now doesn’t
  // pass that style’s RegExp test, remove that style.
  // Heuristic for a style range that’s the same between old content and new
  // is the start of every style must be the same.
  getContiguousStyleRangesAtOffset(
    nextContent.getBlockForKey(startKey),
    startOffset,
    isExpandableStyle
  ).forEach((range, styleKey: CoreExpandableStyleName) => {
    if (range!.start < prevStartOffset) {
      const block = nextContent.getBlockForKey(startKey);
      const pattern = getPatternRegExp(styleKey);
      const text = block.getText().slice(range!.start, range!.end);
      pattern.lastIndex = 0;
      if (!pattern.test(text)) {
        nextContent = stripStylesFromBlock(
          nextContent,
          startKey,
          key => key === styleKey || isStyleDecorator(key),
          range!.start,
          range!.end
        );
      }
    }
  });

  if (nextContent !== content) {
    return commit(editorState, nextContent);
  }

  // Finally, remove styles continued from the end of a style range.
  if (changeType === 'insert-fragment' || changeType === 'insert-characters') {
    const endedStyles = getContiguousStyleRangesAtOffset(
      prevContent.getBlockForKey(prevStartKey),
      prevStartOffset - 1,
      isCoreStyle
    ).filter(range => range!.end === prevStartOffset);

    if (endedStyles.size) {
      nextContent = stripStylesFromBlock(nextContent, prevStartKey, s => endedStyles.has(s), prevStartOffset, startOffset);
      return commit(editorState, nextContent);
    }
  }

  return editorState;
};
