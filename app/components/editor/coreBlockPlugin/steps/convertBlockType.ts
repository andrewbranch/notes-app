import { EditorState, ContentState, Modifier } from 'draft-js';
import { blockValues, blocks, CoreBlockDefinition } from '../blocks';
import { createSelectionWithBlock, performUnUndoableEdits, createSelectionWithRange } from '../../../../utils/draftUtils';
import { OrderedSet } from 'immutable';

const matchBlock = (text: string): [CoreBlockDefinition, RegExpExecArray] | [null, null] => {
  for (let block of blockValues) {
    const match = block!.pattern.exec(text);
    if (match) return [block!, match];
  }
  return [null, null];
}

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
      const currentBlockDefinition = blocks[currentBlockType];
      const [newBlockDefinition, match] = matchBlock(blockText);
      if (newBlockDefinition && match) {
        if (currentBlockType !== newBlockDefinition.type) {
          let result = Modifier.setBlockType(content, createSelectionWithBlock(block!), newBlockDefinition.type);
          if (match[1]) {
            result = Modifier.replaceText(
              result,
              createSelectionWithRange(block!, match.index, match[1].length),
              match[1],
              OrderedSet(['core.block.decorator'])
            );
          }
          return result;
        }
      } else if (currentBlockType !== 'unstyled' && (!currentBlockDefinition || currentBlockDefinition.expandable)) {
        return Modifier.removeInlineStyle(
          Modifier.setBlockType(content, createSelectionWithBlock(block!), 'unstyled'),
          createSelectionWithBlock(block!),
          'core.block.decorator'
        );
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