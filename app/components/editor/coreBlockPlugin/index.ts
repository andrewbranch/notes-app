import { Plugin } from 'draft-js-plugins-editor';
import { EditorState, Modifier, RichUtils, KeyBindingUtil, getDefaultKeyBinding } from 'draft-js';
import { convertBlockType } from './steps/convertBlockType';
import { collapseBlocks, collapseBlocksAtSelectionEdges } from './steps/collapseBlocks';
import { expandBlocks } from './steps/expandBlocks';
import { blocks } from './blocks';
import { createSelectionWithBlock, createSelectionWithRange } from '../../../utils/draftUtils';

const MAX_TAB_DEPTH = 5;

export const createCoreBlockPlugin = (getEditorState: () => EditorState): Plugin => ({
  onChange: editorState => {
    const prevEditorState = getEditorState();
    const editorStateWithConvertedBlocks = convertBlockType(editorState, prevEditorState);
    const editorStateWithCollapsedBlocks = collapseBlocks(editorStateWithConvertedBlocks);
    return expandBlocks(editorStateWithCollapsedBlocks);
  },

  handleKeyCommand: (command, editorState, { setEditorState }) => {
    if (command === '@core/increase-depth') {
      // TODO
      return 'not-handled';
    } else if (command === '@core/decrease-depth') {
      // TODO
      return 'not-handled';
    }

    // Handle backspacing to unset non-expandable block types
    const selection = editorState.getSelection();
    const isBackspace = command === 'backspace' || command === 'backspace-word' || command === 'backspace-to-start-of-line';
    if (isBackspace && selection.isCollapsed() && selection.getStartOffset() === 0) {
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

  keyBindingFn(event) {
    const isCmd = KeyBindingUtil.hasCommandModifier(event);
    if (isCmd && event.key === '[') {
      return '@core/decrease-depth';
    } else if (isCmd && event.key === ']') {
      return '@core/increase-depth';
    }

    return getDefaultKeyBinding(event);
  },

  onTab: (event, { getEditorState, setEditorState }) => {
    const editorState = getEditorState();
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      return;
    }

    const block = content.getBlockForKey(selection.getStartKey());
    // Allow shift-tab to move focus if it’s going to be a no-op
    if (event.shiftKey && (block.getDepth() === 0 || !['unordered-list-item', 'ordered-list-item'].includes(block.getType()))) {
      return;
    }

    // Otherwise let RichUtils handle the event, which will `event.preventDefault()` right away,
    // and possibly adjust the depth of list items.
    const newEditorState = RichUtils.onTab(event, editorState, MAX_TAB_DEPTH);
    if (newEditorState !== editorState) {
      setEditorState(newEditorState);
    }
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
