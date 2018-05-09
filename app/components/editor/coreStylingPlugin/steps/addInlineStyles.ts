import { EditorState, Modifier } from 'draft-js';
import { is, Map } from 'immutable';
import { createSelectionWithRange, stripStylesFromBlock, getContiguousStyleRangesAtOffset, Range, performUnUndoableEdits } from '../../../../utils/draftUtils';
import { expandableStyleValues, isExpandableStyle, expandableStyles, CoreExpandableStyleName } from '../styles';

export const addInlineStyles = (editorState: EditorState, prevEditorState: EditorState): EditorState => {
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
  const prevSelection = prevEditorState.getSelection();
  const focusKey = selection.getFocusKey();
  const affectedBlocks = changeType === 'split-block' ? [focusKey, prevSelection.getStartKey()] : [focusKey];
  let nextContent = content;

  // Go through each styling entity and reapply
  affectedBlocks.forEach(blockKey => {
    const newText = nextContent.getBlockForKey(blockKey).getText();
    expandableStyleValues.forEach(style => {
      let matchIndex = -1;
      let lastValidMatch: { index: number; styleRanges: Map<string, Range> } | undefined;
      while ((matchIndex = newText.indexOf(style.pattern, matchIndex + 1)) > -1) {
        const block = nextContent.getBlockForKey(blockKey);
        const match = {
          index: matchIndex,
          styleRanges: getContiguousStyleRangesAtOffset(block, matchIndex, isExpandableStyle)
        };

        if (
          lastValidMatch &&
          match.index - lastValidMatch.index > 1 && // Zero-length ranges are not allowed
          is(lastValidMatch.styleRanges, match.styleRanges) &&
          match.styleRanges.every((_, styleKey: CoreExpandableStyleName) => expandableStyles[styleKey].allowsNesting)
        ) {
          const start = lastValidMatch.index;
          const end = match.index + style.pattern.length;

          if (!style.allowsNesting) {
            // This style range should take on styles it is nested in, but remove any
            // that it would be nesting. Simplest implementation is to unapply any styles
            // that don’t already exist at the beginning of this range.
            const stylesAtStartOfNewStyleRange = block.getInlineStyleAt(start);
            nextContent = stripStylesFromBlock(
              nextContent,
              block,
              styleKey => !stylesAtStartOfNewStyleRange.includes(styleKey),
              start,
              end
            );
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

  if (content !== nextContent) {
    return performUnUndoableEdits(editorState, disabledUndoEditorState => {
      return EditorState.forceSelection(
        EditorState.push(disabledUndoEditorState, nextContent, 'change-inline-style'),
        selection
      );
    });
  }

  return editorState;
};
