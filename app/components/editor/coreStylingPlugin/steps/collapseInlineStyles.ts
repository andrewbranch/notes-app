import { EditorState, ContentBlock, SelectionState, ContentState } from 'draft-js';
import { Edit, hasEdgeWithin, getContiguousStyleRangesNearSelectionEdges } from '../../../../utils/draftUtils';
import { isStyleDecorator, isExpandableStyle, CoreExpandableStyleName, expandableStyles, getPatternRegExp } from '../styles';

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
  getContiguousStyleRangesNearSelectionEdges(content, prevSelection, isExpandableStyle).forEach((ranges, styleKey: CoreExpandableStyleName) => {
    ranges!.forEach(range => {
      const { blockKey, start, end } = range!;
      if (!currentSelection || !hasEdgeWithin(currentSelection, blockKey, start, end)) {
        const block = content.getBlockForKey(blockKey);
        const style = expandableStyles[styleKey];
        const expandedText = block.getText().slice(start, end);
        const pattern = getPatternRegExp(styleKey);
        pattern.lastIndex = 0;
        if (pattern.test(expandedText)) {
          edits.push(
            deleteRange(block, start, start + style.pattern.length),
            deleteRange(block, end - style.pattern.length, end)
          );
        }
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
