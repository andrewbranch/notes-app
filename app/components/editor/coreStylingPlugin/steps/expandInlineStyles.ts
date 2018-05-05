import { EditorState } from 'draft-js';
import { getContiguousStyleRangesNearSelectionEdges, Edit, InsertionEdit } from '../../../../utils/draftUtils';
import { isExpandableStyle, CoreExpandableStyleName, expandableStyles, getPatternRegExp, expandableStyleKeys } from '../styles';
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

  type InsertionEditWithOwnStyle = InsertionEdit & { ownStyle: CoreExpandableStyleName };
  /**
   * A tuple whose two entries correspond to insertions happening at either end of the selection.
   * Each entry is an array of tuples: each entry in each array is a tuple representing the leading
   * and trailing characters to be inserted for a single style range. This data structure serves
   * as a staging ground for the final flat array of edits, as each style range being expanded has
   * an effect on the ones that get expanded inside it. That effect is added as this data structure
   * gets transferred and flattened into `edits`.
   */
  const insertionPairs: [[InsertionEditWithOwnStyle, InsertionEditWithOwnStyle][], [InsertionEditWithOwnStyle, InsertionEditWithOwnStyle][]] = [[], []];
  const done = [false, false];
  const skippedStyles: [Set<CoreExpandableStyleName>, Set<CoreExpandableStyleName>] = [Set(), Set()];
  getContiguousStyleRangesNearSelectionEdges(
    content,
    selection,
    isExpandableStyle
  // It would be more efficient just to apply styles in a deterministic order, but there are no good APIs for that in Draft.
  // As it is, styles appear in the order they’re added. We want to process them from the outside in.
  ).sortBy(
    (_, key: CoreExpandableStyleName) => key,
    (a, b) => expandableStyleKeys.indexOf(b) - expandableStyleKeys.indexOf(a)
  ).forEach((ranges, styleKey: CoreExpandableStyleName) => {
    const style = expandableStyles[styleKey];
    let rangeIndex = 0;
    ranges!.forEach(range => {
      if (done[rangeIndex]) {
        // Even though we aren’t expanding this style, we need to track it
        // as one to be removed from others.
        skippedStyles[rangeIndex] = skippedStyles[rangeIndex].add(styleKey);
        rangeIndex++;
        return;
      }

      const { blockKey, start, end } = range!;
      const block = content.getBlockForKey(blockKey);
      const collapsedText = block.getText().slice(start, end);
      const pattern = getPatternRegExp(styleKey);
      pattern.lastIndex = 0;
      if (!pattern.test(collapsedText)) {
        insertionPairs[rangeIndex].push([{
          type: 'insertion',
          blockKey,
          offset: start,
          style: block.getInlineStyleAt(start).add('core.styling.decorator'),
          text: style.pattern,
          ownStyle: styleKey
        }, {
          type: 'insertion',
          blockKey,
          offset: start + collapsedText.length,
          style: block.getInlineStyleAt(start).add('core.styling.decorator'),
          text: style.pattern,
          ownStyle: styleKey
        }]);

        const selectionOffset = rangeIndex === 0 ? selection.getStartOffset() : selection.getEndOffset();
        // If the selection is on the edge of the range we’re expanding, that means
        // the selection will be pushed away from nested ranges inside this range,
        // which means they’re no longer valid to be expanded. So, skip adding them.
        // E.g., when the cursor moves to the trailing edge of a bold & italic “x,”
        // the italic decorator characters are added to `insertionPairs` first, then
        // the bold decorator characters are considered. If we were to insert both of
        // them, the result would be “**_x_**|” (where | is the cursor), which is not
        // a valid state since the selection is no longer adjacent to the italic range.
        // So, before adding the bold decorator characters to `insertionPairs`, we
        // check to see if the selection will be pushed to the edge of the new range,
        // and if it is, we skip processing any more decorator character insertions.
        if (selectionOffset <= start || selectionOffset >= start + collapsedText.length) {
          done[rangeIndex] = true;
        }
      }
      rangeIndex++;
    });
  });

  // Copy from `insertionPairs` to `insertionEdits`, starting with the innermost and working out,
  // subtracting their styles along the way. E.g., for “**_`x`_**,” we’d copy the backtick insertion
  // with all styles, then add the underscore insertions with all its styles minus code, then the
  // asterisk insertions with all its styles minus code and italics.
  insertionPairs.forEach((pairs, index) => {
    let accumStyles: Set<string> = skippedStyles[index];
    pairs.forEach(pair => {
      pair[0].style = pair[1].style = pair[0].style!.subtract(accumStyles) as OrderedSet<string>;
      accumStyles = accumStyles.add(pair[0].ownStyle);
      insertionEdits[index] = [pair[0], ...insertionEdits[index], pair[1]];
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
