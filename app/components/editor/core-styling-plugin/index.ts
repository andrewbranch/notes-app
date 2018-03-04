import { EditorState, Modifier } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { stripEntitiesFromBlock, createSelectionWithRange } from '../../../utils/draft-utils';
import { stylingEntities } from './entities';
import { decorators } from './decorators';
import { shouldProcessChanges } from './shouldProcessChange';

const processChange = (editorState: EditorState, affectedBlocks: string[] = [editorState.getSelection().getStartKey()]): EditorState => {
  const selectionState = editorState.getSelection();
  let contentState = editorState.getCurrentContent();

  // Because a single character change could change several entites in a block,
  // easiest thing to do is to delete them all and recreate them all.
  // This probably isn’t the most efficient thing, so we might need to
  // revisit this logic later if performance suffers.
  affectedBlocks.forEach(blockKey => {
    contentState = stripEntitiesFromBlock(
      contentState,
      blockKey,
      entity => entity.getType().startsWith('core.styling')
    );

    const newText = contentState.getBlockForKey(blockKey).getText();

    // Go through each styling entity and reapply
    stylingEntities.forEach(style => {
      let matchArr;
      do {
        matchArr = style.rawPattern.exec(newText);
        if (matchArr) {
          contentState = style.createEntity(contentState);
          const entityKey = contentState.getLastCreatedEntityKey();
          const entitySelection = createSelectionWithRange(blockKey, matchArr.index, matchArr.index + matchArr[0].length);
          contentState = Modifier.applyEntity(contentState, entitySelection, entityKey);
        }
      } while (matchArr);
    });
  });

  let newEditorState = EditorState.push(editorState, contentState, 'apply-entity');
  if (newEditorState !== editorState) {
    // If we’ve done anything here, reset selection back to what it was before.
    newEditorState = EditorState.forceSelection(newEditorState, selectionState);
  }

  return newEditorState;
}

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  onChange: editorState => {
    const changeType = editorState.getLastChangeType();
    const oldEditorState = getEditorState();
    if (shouldProcessChanges(changeType, oldEditorState, editorState)) {
      switch (changeType) {
        case 'delete-character':
        case 'remove-range':
        case 'backspace-character': return processChange(editorState);
        case 'split-block': return processChange(editorState, [
          oldEditorState.getSelection().getStartKey(),
          editorState.getSelection().getStartKey()
        ]);
        case 'insert-characters':
          return processChange(editorState);
      }
    }

    return editorState;
  },

  decorators
});