import { EditorState } from 'draft-js';
import { getContiguousStyleRangesNearSelectionEdges, Edit, performDependentEdits, InsertionEdit } from '../../../../utils/draft-utils';
import { isCoreStyle, CoreInlineStyleName, styles } from '../styles';
import { OrderedSet } from 'immutable';

export const expandInlineStyle = (editorState: EditorState) => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const edits: Edit[] = [];
  getContiguousStyleRangesNearSelectionEdges(
    content,
    selection,
    isCoreStyle
  ).forEach((ranges, styleKey: CoreInlineStyleName) => {
    const style = styles[styleKey];
    ranges!.forEach(range => {
      const [blockKey, start, end] = range;
      const block = content.getBlockForKey(blockKey);
      style.pattern.lastIndex = 0;
      if (!style.pattern.test(block.getText().slice(start, end))) {
        edits.push({
          type: 'insertion',
          blockKey,
          offset: start,
          text: '`',
          style: OrderedSet([styleKey])
        }, {
          type: 'insertion',
          blockKey,
          offset: end,
          text: '`',
          style: OrderedSet([styleKey])
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
      adjustFocusForInsertions
    });
  }

  return performDependentEdits(editorState, edits);
};
