import { EditorState, ContentState, Modifier } from 'draft-js';
import { blocks } from '../blocks';
import { hasEdgeWithin, createSelectionWithRange, performUnUndoableEdits } from '../../../../utils/draftUtils';

export const collapseBlocks = (editorState: EditorState, affectedBlocks = editorState.getCurrentContent().getBlockMap().keySeq().toArray()): EditorState => {
  const selection = editorState.getSelection();
  const currentContent = editorState.getCurrentContent();
  const nextContent = affectedBlocks.reduce((content: ContentState, blockKey) => {
    const block = content.getBlockForKey(blockKey);
    const blockDefinition = blocks[block.getType()];
    if (blockDefinition && blockDefinition.expandable && !hasEdgeWithin(selection, blockKey, 0, block.getLength())) {
      const blockText = block.getText();
      const match = blockText.match(blockDefinition.pattern);
      if (match) {
        return Modifier.replaceText(
          content,
          createSelectionWithRange(blockKey, 0, match[0].length),
          ''
        );
      }
    }

    return content;
  }, currentContent);

  if (nextContent !== currentContent) {
    return EditorState.forceSelection(
      performUnUndoableEdits(editorState, disabledUndoEditorState => {
        return EditorState.push(disabledUndoEditorState, nextContent, 'remove-range');
      }),
      selection
    );
  }

  return editorState;
}