import { EditorState } from 'draft-js';
import { uniq, flatMap } from 'lodash';
import { getContiguousStyleRangesNearSelectionEdges, DeletionEdit, performDependentEdits, Edit } from '../../../../utils/draft-utils';
import { isCoreStyle, CoreInlineStyleName, styles } from '../styles';

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
              style.pattern.lastIndex = 0;
              if (style.pattern.test(block.getText().slice(start, end))) {
                blockEdits.push({
                  type: 'deletion',
                  blockKey,
                  offset: start,
                  length: style.decoratorLength
                }, {
                  type: 'deletion',
                  blockKey,
                  offset: end - style.decoratorLength,
                  length: style.decoratorLength
                });
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
        anchorOffset: selection.getAnchorOffset()
      });
    }

    return blockEdits;
  });

  return performDependentEdits(editorState, edits);
};
