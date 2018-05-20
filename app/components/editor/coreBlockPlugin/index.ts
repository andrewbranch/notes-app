import { Plugin } from 'draft-js-plugins-editor';
import { EditorState, Modifier } from 'draft-js';
import { convertBlockType } from './steps/convertBlockType';
import { collapseBlocks, collapseBlocksAtSelectionEdges } from './steps/collapseBlocks';
import { expandBlocks } from './steps/expandBlocks';
import { blocks } from './blocks';
import { createSelectionWithBlock, createSelectionWithRange } from '../../../utils/draftUtils';

export const createCoreBlockPlugin = (getEditorState: () => EditorState): Plugin => ({
  onChange: editorState => {
    const prevEditorState = getEditorState();
    const editorStateWithConvertedBlocks = convertBlockType(editorState, prevEditorState);
    const editorStateWithCollapsedBlocks = collapseBlocks(editorStateWithConvertedBlocks);
    return expandBlocks(editorStateWithCollapsedBlocks);
  },

  // Handle backspacing to unset non-expandable block types
  handleKeyCommand: (command, editorState, { setEditorState }) => {
    const selection = editorState.getSelection();
    const isBackspace = command === 'backspace' || command === 'backspace-word' || command === 'backspace-to-start-of-line';
    if (isBackspace && selection.getStartOffset() === 0) {
      const content = editorState.getCurrentContent();
      const block = content.getBlockForKey(selection.getStartKey());
      const blockDefinition = blocks[block.getType()];
      if (blockDefinition && !blockDefinition.expandable) {
        let nextContent = Modifier.setBlockType(content, createSelectionWithBlock(block), 'unstyled');
        let nextSelection = selection;
        if (command === 'backspace') {
          const textToInsert = blockDefinition.canonicalPattern.slice(0, -1);
          nextContent = Modifier.insertText(nextContent, createSelectionWithRange(block, 0, 0), textToInsert);
          nextSelection = createSelectionWithRange(block, textToInsert.length, textToInsert.length);
        } else {
          nextSelection = createSelectionWithRange(block, 0, 0);
        }

        let nextEditorState = EditorState.push(editorState, nextContent, 'change-block-type');
        if (nextSelection !== selection) {
          nextEditorState = EditorState.forceSelection(nextEditorState, nextSelection);
        }

        setEditorState(nextEditorState);
        return 'handled';
      }
    }
    return 'not-handled';
  },

  customStyleMap: {
    'core.block.decorator': {
      color: 'rgba(0, 0, 0, 0.3)'
    }
  }
});

export const normalizeCoreBlocks = (editorState: EditorState) => {
  return collapseBlocksAtSelectionEdges(editorState);
}
