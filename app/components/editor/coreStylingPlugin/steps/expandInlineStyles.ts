import { EditorState } from 'draft-js';
import { getContiguousStyleRangesNearSelectionEdges, Edit, InsertionEdit } from '../../../../utils/draftUtils';
import { isExpandableStyle, CoreExpandableStyleName, expandableStyles, getPatternRegExp } from '../styles';
import { Set, OrderedSet } from 'immutable';

export const expandInlineStyle = (editorState: EditorState): Edit[] => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  if (!selection.getHasFocus()) {
    return [];
  }

  /**
   * A flattened array of insertion edits and a selection edit: the final data structure
   * to be passed to `performDependentEdits`.
   */
  let edits: Edit[] = [];
  /**
   * A tuple whose two entries correspond to insertions happening at either end of the selection.
   * If the selection is collapsed, the latter will remain empty.
   */
  const insertionEdits: [InsertionEdit[], InsertionEdit[]] = [[], []];
  /**
   * A tuple whose two entries correspond to insertions happening at either end of the selection.
   * Each entry is an array of tuples: each entry in each array is a tuple representing the leading
   * and trailing characters to be inserted for a single style range. This data structure serves
   * as a staging ground for the final flat array of edits, as each style range being expanded has
   * an effect on the ones that get expanded inside it. That effect is added as this data structure
   * gets transferred and flattened into `edits`.
   */
  const insertionPairs: [[InsertionEdit, InsertionEdit][], [InsertionEdit, InsertionEdit][]] = [[], []];
  getContiguousStyleRangesNearSelectionEdges(
    content,
    selection,
    isExpandableStyle
  ).forEach((ranges, styleKey: CoreExpandableStyleName) => {
    const style = expandableStyles[styleKey];
    let rangeIndex = 0;
    ranges!.forEach(range => {
      const { blockKey, start, end } = range!;
      const block = content.getBlockForKey(blockKey);
      const collapsedText = block.getText().slice(start, end);
      const pattern = getPatternRegExp(styleKey);
      pattern.lastIndex = 0;
      if (!pattern.test(collapsedText)) {
        insertionPairs[rangeIndex].unshift([{
          type: 'insertion',
          blockKey,
          offset: start,
          style: Set([styleKey]),
          text: style.pattern
        }, {
          type: 'insertion',
          blockKey,
          offset: start + collapsedText.length,
          style: Set([styleKey]),
          text: style.pattern
        }]);
      }
      rangeIndex++;
    });
  });

  // Copy from `insertionPairs` to `insertionEdits`, adding their styles along the way
  insertionPairs.forEach((pairs, index) => {
    let accumStyles = OrderedSet(['core.styling.decorator']);
    pairs.forEach(pair => {
      pair[0].style = pair[1].style = accumStyles = accumStyles.concat(pair[0].style) as OrderedSet<string>;
      insertionEdits[index].splice(insertionEdits[index].length / 2, 0, pair[0], pair[1]);
    });
  });

  // Copy from `insertionEdits` to `edits` just to flatten
  edits = [...insertionEdits[0], ...insertionEdits[1]];

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
