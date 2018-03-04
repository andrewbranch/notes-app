import { EditorState, Modifier, SelectionState } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { stripEntitiesFromBlock, getInsertedCharactersFromChange } from '../../../utils/draft-utils';
import { stylingEntities } from './entities';
import { decorators } from './decorators';

const processChange = (editorState: EditorState, insertedCharacter: string | null, isBackspace = false): EditorState => {
  const selectionState = editorState.getSelection()
  const cursorPositionKey = selectionState.getStartKey();
  let contentState = editorState.getCurrentContent();

  // Because a single character change could change several entites in a block,
  // easiest thing to do is to delete them all and recreate them all.
  // This probably isn’t the most efficient thing, so we might need to
  // revisit this logic later if performance suffers.
  contentState = stripEntitiesFromBlock(
    contentState,
    cursorPositionKey,
    entity => entity.getType().startsWith('core.styling')
  );

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
    // If we’ve done anything here, reset selection back to what it was before.
    newEditorState = EditorState.forceSelection(newEditorState, selectionState);
  }

  return newEditorState;
}

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  onChange: editorState => {
    const changeType = editorState.getLastChangeType();
    switch (changeType) {
      case 'delete-character':
      case 'remove-range':
      case 'backspace-character': return processChange(editorState, null, true);
      case 'insert-characters':
        const oldEditorState = getEditorState();
        const insertedCharacters = getInsertedCharactersFromChange(oldEditorState, editorState);
        return processChange(editorState, insertedCharacters);
      default: return editorState;
    }
  },

  decorators
});