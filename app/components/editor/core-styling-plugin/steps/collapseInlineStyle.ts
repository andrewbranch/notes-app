import { EditorState, ContentBlock, SelectionState, ContentState } from 'draft-js';
import { Edit, hasEdgeWithin, getContiguousStyleRangesNearSelectionEdges } from '../../../../utils/draft-utils';
import { isCoreStyle, styles, CoreInlineStyleName, getPatternRegExp } from '../styles';

const collapseRange = (block: ContentBlock, styleKey: CoreInlineStyleName, start: number, end: number): Edit[] => {
  const style = styles[styleKey];
  const blockKey = block.getKey();
  const expandedText = block.getText().slice(start, end);
  const pattern = getPatternRegExp(styleKey);
  pattern.lastIndex = 0;
  if (pattern.test(expandedText)) {
    const styles = block.getInlineStyleAt(start);
    return [{
      type: 'insertion',
      blockKey,
      offset: start,
      style: styles,
      deletionLength: style.pattern.length,
      text: ''
    }, {
      type: 'insertion',
      blockKey,
      offset: start + expandedText.length - style.pattern.length,
      style: styles,
      deletionLength: style.pattern.length,
      text: ''
    }];
  }
  return [];
}

export function collapseInlineStyleRangesAtSelectionEdges(content: ContentState, prevSelection: SelectionState, currentSelection?: SelectionState): Edit[] {
  const edits: Edit[] = [];
  getContiguousStyleRangesNearSelectionEdges(content, prevSelection, isCoreStyle).forEach((ranges, styleKey: CoreInlineStyleName) => {
    ranges!.forEach(range => {
      const { blockKey, start, end } = range!;
      if (!currentSelection || !hasEdgeWithin(currentSelection, blockKey, start, end)) {
        const block = content.getBlockForKey(blockKey);
        edits.push(...collapseRange(block, styleKey, start, end));
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
  block.findStyleRanges(character => character.getStyle().some(isCoreStyle), (start, end) => {
    const styles = block.getInlineStyleAt(start);
    styles.forEach((style: CoreInlineStyleName) => {
      edits.push(...collapseRange(block, style, start, end));
    });
  });

  return edits;
};
