import { EditorState } from 'draft-js';
import { uniq, flatMap } from 'lodash';
import { getContiguousStyleRangesNearSelectionEdges, performDependentEdits, Edit, performUnUndoableEdits } from '../../../../utils/draft-utils';
import { isCoreStyle, CoreInlineStyleName, styles } from '../styles';
import { OrderedSet } from 'immutable';

export const collapseInlineStyles = (editorState: EditorState) => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const focusKey = selection.getFocusKey();
  const anchorKey = selection.getAnchorKey();
  const edits = flatMap(content.getBlocksAsArray(), block => {
    const blockEdits: Edit[] = [];
    block.findStyleRanges(
      character => character.getStyle().some(isCoreStyle),
      (start, end) => {
        const blockKey = block.getKey();
        if (!selection.hasEdgeWithin(blockKey, start, end)) {
          const styleKeys = block.getInlineStyleAt(start);
          styleKeys.forEach(styleKey => {
            if (styleKey && isCoreStyle(styleKey)) {
              const style = styles[styleKey];
              const expandedText = block.getText().slice(start, end);
              style.pattern.lastIndex = 0;
              if (style.pattern.test(expandedText)) {
                blockEdits.push(...style.collapse({ blockKey, offset: start, style: OrderedSet([styleKey]) }, expandedText));
              }
            }
          });
        }
      }
    );

    if (blockEdits.length) {
      blockEdits.push({
        type: 'selection',
        focusKey: selection.getFocusKey(),
        focusOffset: selection.getFocusOffset(),
        anchorKey: selection.getAnchorKey(),
        anchorOffset: selection.getAnchorOffset(),
        isBackward: selection.getIsBackward()
      });
    }

    return blockEdits;
  });

  return performUnUndoableEdits(editorState, disabledUndoEditorState => performDependentEdits(disabledUndoEditorState, edits));
};
