import { EditorState } from 'draft-js';
import { getContiguousStyleRangesNearSelectionEdges, Edit, performDependentEdits } from '../../../../utils/draft-utils';
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
    edits.push({
      type: 'selection',
      focusKey: selection.getFocusKey(),
      focusOffset: selection.getFocusOffset(),
      anchorKey: selection.getAnchorKey(),
      anchorOffset: selection.getAnchorOffset()
    });
  }

  return performDependentEdits(editorState, edits);
};
