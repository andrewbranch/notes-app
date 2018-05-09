import { Plugin } from 'draft-js-plugins-editor';
import { EditorState, Modifier } from 'draft-js';
import { resetBlockType } from './steps/resetBlockType';
import { collapseBlocks } from './steps/collapseBlocks';
import { expandBlocks } from './steps/expandBlocks';
import { MAX_BLOCK_SEQ_LENGTH, blockValues } from './blocks';
import { createSelectionWithBlock, performUnUndoableEdits } from '../../../utils/draftUtils';

export const createCoreBlockPlugin = (getEditorState: () => EditorState): Plugin => ({
  handleBeforeInput: (chars, editorState, { setEditorState }) => {
    const selection = editorState.getSelection();
    // Creates special block types upon inserting a space
    if (chars === ' ' && selection.getStartOffset() <= MAX_BLOCK_SEQ_LENGTH) {
      const content = editorState.getCurrentContent();
      const block = content.getBlockForKey(selection.getStartKey());
      const blockText = block!.getText() + ' ';
      const currentBlockType = block!.getType();
      const newBlockDefinition = blockValues.find(b => b!.pattern.test(blockText));
      if (newBlockDefinition && currentBlockType !== newBlockDefinition.type) {
        const nextContent = Modifier.setBlockType(content, createSelectionWithBlock(block), newBlockDefinition.type);
        setEditorState(performUnUndoableEdits(editorState, disabledUndoEditorState => {
          return EditorState.forceSelection(
            EditorState.push(disabledUndoEditorState, nextContent, 'change-block-type'),
            selection
          );
        }));

        return 'handled';
      }
    }

    return 'not-handled';
  },

  onChange: editorState => {
    const prevEditorState = getEditorState();
    const editorStateWithConvertedBlocks = resetBlockType(editorState, prevEditorState);
    const editorStateWithCollapsedBlocks = collapseBlocks(editorStateWithConvertedBlocks);
    return expandBlocks(editorStateWithCollapsedBlocks);
  }
});
