import { EditorState } from 'draft-js';
import { getInsertedCharactersFromChange, EditorChangeType, getDeletedCharactersFromChange } from '../../../utils/draft-utils';
import { TRIGGER_CHARACTERS } from './entities';

export const shouldProcessChanges = (changeType: EditorChangeType, oldEditorState: EditorState, newEditorState: EditorState): boolean => {
  switch (changeType) {
    case 'backspace-character':
    case 'delete-character':
    case 'remove-range':
    case 'insert-characters':
      const deletedCharacters = getDeletedCharactersFromChange(changeType, oldEditorState, newEditorState);
      const insertedCharacters = getInsertedCharactersFromChange(changeType, oldEditorState, newEditorState);
      return TRIGGER_CHARACTERS.some(c => insertedCharacters.includes(c) || deletedCharacters.includes(c));
    case 'split-block':
      const oldSelection = oldEditorState.getSelection();
      const oldContent = oldEditorState.getCurrentContent();
      const startBlock = oldContent.getBlockForKey(oldSelection.getStartKey());
      const startSplitEntityKey = startBlock.getEntityAt(oldSelection.getStartOffset());
      if (startSplitEntityKey && oldContent.getEntity(startSplitEntityKey).getType().startsWith('core.styling')) {
        return true;
      }

      const newSelection = newEditorState.getSelection();
      const newContent = newEditorState.getCurrentContent();
      const endBlock = newContent.getBlockForKey(newSelection.getStartKey());
      const endSplitEntityKey = endBlock.getEntityAt(newSelection.getStartOffset());
      if (endSplitEntityKey && newContent.getEntity(endSplitEntityKey).getType().startsWith('core.styling')) {
        return true;
      }

      return false;
    default:
      return true;
  }
};