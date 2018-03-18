import { EditorState } from 'draft-js';
import { Edit, hasEdgeWithin, getContiguousStyleRangesNearSelectionEdges } from '../../../../utils/draft-utils';
import { isCoreStyle, styles, CoreInlineStyleName, getPatternRegExp } from '../styles';

export const collapseInlineStyles = (editorState: EditorState, prevEditorState: EditorState): Edit[] => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const prevSelection = prevEditorState.getSelection();
  const focusKey = selection.getFocusKey();
  const anchorKey = selection.getAnchorKey();
  const edits: Edit[] = [];
  getContiguousStyleRangesNearSelectionEdges(content, prevSelection, isCoreStyle).forEach((ranges, styleKey: CoreInlineStyleName) => {
    const style = styles[styleKey];
    ranges!.forEach(range => {
      const { blockKey, start, end } = range!;
      if (!hasEdgeWithin(selection, blockKey, start, end)) {
        const block = content.getBlockForKey(blockKey);
        const expandedText = block.getText().slice(start, end);
        const pattern = getPatternRegExp(styleKey);
        pattern.lastIndex = 0;
        if (pattern.test(expandedText)) {
          const styles = block.getInlineStyleAt(start);
          edits.push(...style.collapse({ blockKey, offset: start, style: styles }, expandedText));
        }
      }
    });
  });

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
