import { EditorState, ContentState, Modifier } from 'draft-js';
import { blockValues } from '../blocks';
import { createSelectionWithBlock, performUnUndoableEdits } from '../../../../utils/draftUtils';

export const convertBlockType = (editorState: EditorState, prevEditorState: EditorState): EditorState => {
  const content = editorState.getCurrentContent();
  const prevContent = prevEditorState.getCurrentContent();
  if (content === prevContent) {
    return editorState;
  }

  const selection = editorState.getSelection();
  const prevSelection = prevEditorState.getSelection();
  const nextContent = content.getBlockMap()
    .skipUntil((_, key) => key === prevSelection.getStartKey())
    .takeUntil((_, key) => {
      const firstNonMatchingBlock = content.getBlockAfter(selection.getEndKey());
      return firstNonMatchingBlock && firstNonMatchingBlock.getKey() === key;
    })
    .reduce((content: ContentState, block) => {
      const blockText = block!.getText();
      const currentBlockType = block!.getType();
      const matchingBlockPattern = blockValues.find(b => blockText.startsWith(b!.pattern));
      if (matchingBlockPattern) {
        if (currentBlockType !== matchingBlockPattern.type) {
          return Modifier.setBlockType(content, createSelectionWithBlock(block!), matchingBlockPattern.type);
        }
      } else if (currentBlockType !== 'unstyled') {
        return Modifier.setBlockType(content, createSelectionWithBlock(block!), 'unstyled');
      }

      return content;
    }, editorState.getCurrentContent());
  
  if (nextContent !== content) {
    return performUnUndoableEdits(editorState, disabledUndoEditorState => {
      return EditorState.forceSelection(
        EditorState.push(disabledUndoEditorState, nextContent, 'change-block-type'),
        selection
      );
    });
  }

  return editorState;
}