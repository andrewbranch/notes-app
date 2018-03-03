import { EditorState, Modifier, SelectionState } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { stripEntitiesFromBlock } from '../../../utils/draft-utils';
import { stylingEntities } from './entities';
import { decorators } from './decorators';

const processChange = (editorState: EditorState, insertedCharacter: string | null, isBackspace = false): EditorState => {
  const selectionState = editorState.getSelection()
  const cursorPositionKey = selectionState.getStartKey();
  let contentState = editorState.getCurrentContent();

  // Because a single character change could change all entities in a block,
  // easiest thing to do is to delete them all and recreate them all.
  // This probably isn’t the most efficient thing, so we might need to
  // revisit this logic later if performance suffers.
  contentState = stripEntitiesFromBlock(
    contentState,
    cursorPositionKey,
    entity => entity.getType().startsWith('core.styling')
  );

  // Insert character manually:
  // If we’re inserting a character in `handleBeforeInput`, the text hasn’t yet been updated,
  // and we need to do it ourselves. In the case of `isBackspace`, the content has already
  // been updated in the `editorState` we were passed, so no need to do anything.
  if (insertedCharacter) {
    if (selectionState.isCollapsed()) {
      contentState = Modifier.insertText(contentState, selectionState, insertedCharacter);
    } else {
      contentState = Modifier.replaceText(contentState, selectionState, insertedCharacter);
    }
  }

  const newText = contentState.getBlockForKey(cursorPositionKey).getText();

  // Go through each styling entity and reapply
  stylingEntities.forEach(style => {
    let matchArr;
    do {
      matchArr = style.rawPattern.exec(newText);
      if (matchArr) {
        contentState = style.createEntity(contentState);
        const entityKey = contentState.getLastCreatedEntityKey();
        const entitySelection = selectionState.merge({
          anchorOffset: matchArr.index,
          focusOffset: matchArr.index + matchArr[0].length
        }) as SelectionState;
        contentState = Modifier.applyEntity(contentState, entitySelection, entityKey);
      }
    } while (matchArr);
  });

  let newEditorState = EditorState.push(editorState, contentState, 'apply-entity');
  if (newEditorState !== editorState) {
    // If we manually inserted a character, we need to move the selection forward by one character.
    if (insertedCharacter) {
      const newCursorPosition = selectionState.getAnchorOffset() + 1;
      newEditorState = EditorState.forceSelection(newEditorState, selectionState.merge({
        anchorOffset: newCursorPosition,
        focusOffset: newCursorPosition
      }) as SelectionState);
    } else {
      // If we were processing a backspace, we just need to put the selection state back how it was
      // before applying the entity.
      newEditorState = EditorState.forceSelection(newEditorState, selectionState);
    }
  }

  return newEditorState;
}

export const createCoreStylingPlugin: () => Plugin = () => ({
  handleBeforeInput: (character, editorState, pluginProvider) => {
    const newEditorState = processChange(editorState, character);
    if (editorState !== newEditorState) {
      pluginProvider.setEditorState(newEditorState);
      return 'handled';
    }

    return 'not-handled';
  },

  onChange: editorState => {
    if (editorState.getLastChangeType() === 'backspace-character') {
      return processChange(editorState, null, true);
    }

    return editorState;
  },

  decorators
});