import { EditorState, ContentBlock, SelectionState, ContentState } from 'draft-js';
import { Edit, hasEdgeWithin, getContiguousStyleRangesNearSelectionEdges, getContiguousStyleRangesNearOffset } from '../../../../utils/draft-utils';
import { isStyleDecorator, isExpandableStyle } from '../styles';

const deleteRange = (block: ContentBlock, start: number, end: number): Edit => {
  const blockKey = block.getKey();
  return {
    type: 'insertion',
    blockKey,
    offset: start,
    deletionLength: end - start,
    text: ''
  };
}

export function collapseInlineStyleRangesAtSelectionEdges(content: ContentState, prevSelection: SelectionState, currentSelection?: SelectionState): Edit[] {
  const edits: Edit[] = [];
  getContiguousStyleRangesNearSelectionEdges(content, prevSelection, isExpandableStyle).forEach(ranges => {
    ranges!.forEach(range => {
      const { blockKey, start, end } = range!;
      if (!currentSelection || !hasEdgeWithin(currentSelection, blockKey, start, end)) {
        const block = content.getBlockForKey(blockKey);
        getContiguousStyleRangesNearOffset(block, start, isStyleDecorator).toList().concat(
          getContiguousStyleRangesNearOffset(block, end, isStyleDecorator)
        ).forEach(styleDecoratorRange => {
          edits.push(deleteRange(block, styleDecoratorRange!.start, styleDecoratorRange!.end));
        });
      }
    });
  });

  return edits;
};

export const collapseInlineStyles = (editorState: EditorState, prevEditorState: EditorState): Edit[] => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const prevSelection = prevEditorState.getSelection();
  
  const edits = collapseInlineStyleRangesAtSelectionEdges(content, prevSelection, selection);
  if (edits.length) {
    edits.push({
      type: 'selection',
      focusKey: selection.getFocusKey(),
      focusOffset: selection.getFocusOffset(),
      anchorKey: selection.getAnchorKey(),
      anchorOffset: selection.getAnchorOffset(),
      isBackward: selection.getIsBackward()
    });
  }

  return edits;
};

export const collapseInlineStylesInBlock = (block: ContentBlock): Edit[] => {
  const edits: Edit[] = [];
  block.findStyleRanges(
    character => character.getStyle().some(isStyleDecorator),
    (start, end) => edits.push(deleteRange(block, start, end))
  );

  return edits;
};
