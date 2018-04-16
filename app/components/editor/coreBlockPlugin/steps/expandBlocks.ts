import { EditorState } from 'draft-js';
import { uniq } from 'lodash';
import { blocks } from '../blocks';
import { InsertionEdit, performDependentEdits } from '../../../../utils/draftUtils';

export const expandBlocks = (editorState: EditorState): EditorState => {
  const currentContent = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const edits = uniq([selection.getStartKey(), selection.getEndKey()]).reduce((edits: InsertionEdit[], blockKey) => {
    const block = currentContent.getBlockForKey(blockKey);
    const blockDefinition = blocks[block.getType()];
    if (blockDefinition && blockDefinition.expandable && !blockDefinition.pattern.test(block.getText())) {
      const edit: InsertionEdit = {
        type: 'insertion',
        blockKey,
        offset: 0,
        text: blockDefinition.canonicalPattern,
        disableUndo: true
      };

      return [...edits, edit];
    }

    return edits;
  }, []);

  if (edits.length) {
    return performDependentEdits(editorState, [
      ...edits,
      {
        type: 'selection',
        anchorKey: selection.getAnchorKey(),
        focusKey: selection.getFocusKey(),
        focusOffset: selection.getFocusOffset(),
        anchorOffset: selection.getAnchorOffset(),
        isBackward: selection.getIsBackward()
      }
    ]);
  }

  return editorState;
};
