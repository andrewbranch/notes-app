import { EditorState } from 'draft-js';
import { getContiguousStyleRangesNearSelectionEdges, Edit, InsertionEdit } from '../../../../utils/draftUtils';
import { isExpandableStyle, CoreExpandableStyleName, expandableStyles, getPatternRegExp } from '../styles';

export const expandInlineStyle = (editorState: EditorState): Edit[] => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const edits: Edit[] = [];
  getContiguousStyleRangesNearSelectionEdges(
    content,
    selection,
    isExpandableStyle
  ).forEach((ranges, styleKey: CoreExpandableStyleName) => {
    const style = expandableStyles[styleKey];
    ranges!.forEach(range => {
      const { blockKey, start, end } = range!;
      const block = content.getBlockForKey(blockKey);
      const collapsedText = block.getText().slice(start, end);
      const pattern = getPatternRegExp(styleKey);
      pattern.lastIndex = 0;
      if (!pattern.test(collapsedText)) {
        const styles = block.getInlineStyleAt(start);
        edits.push({
          type: 'insertion',
          blockKey,
          offset: start,
          style: styles.add('core.styling.decorator'),
          text: style.pattern
        }, {
          type: 'insertion',
          blockKey,
          offset: start + collapsedText.length,
          style: styles.add('core.styling.decorator'),
          text: style.pattern
        });
      }
    });
  });

  if (edits.length) {
    // Special case: when selection is on the leading edge of a newly expanded
    // style range, we want to place the selection before the added characters.
    // The default behavior would be to place the selection immediately before
    // the first character of the collapsed text, i.e., after the added characters.
    const focusKey = selection.getFocusKey();
    const focusOffset = selection.getFocusOffset();
    const anchorKey = selection.getAnchorKey();
    const anchorOffset = selection.getAnchorOffset();
    const leadingEdgeInsertion = edits[0] as InsertionEdit;
    const adjustFocusForInsertions = leadingEdgeInsertion.blockKey === focusKey && leadingEdgeInsertion.offset === focusOffset ? 'leading' : 'trailing';
    const adjustAnchorForInsertions = leadingEdgeInsertion.blockKey === anchorKey && leadingEdgeInsertion.offset === anchorOffset ? 'leading' : 'trailing';
    edits.push({
      type: 'selection',
      focusKey,
      focusOffset,
      anchorKey,
      anchorOffset,
      adjustAnchorForInsertions,
      adjustFocusForInsertions,
      isBackward: selection.getIsBackward()
    });
  }

  return edits;
};
