import { EditorState } from 'draft-js';
import { getInsertedCharactersFromChange, EditorChangeType, getDeletedCharactersFromChange, getAdjacentCharacters } from '../../../utils/draft-utils';
import { TRIGGER_CHARACTERS } from './styles';

export const shouldReprocessInlineStyles = (changeType: EditorChangeType, oldEditorState: EditorState, newEditorState: EditorState): boolean => {
  const newContent = newEditorState.getCurrentContent();
  const newSelection = newEditorState.getSelection();
  const oldSelection = oldEditorState.getSelection();
  const oldContent = oldEditorState.getCurrentContent();
  switch (changeType) {
    case 'backspace-character':
    case 'delete-character':
    case 'remove-range':
    case 'insert-characters':
      const deletedCharacters = getDeletedCharactersFromChange(changeType, oldEditorState, newEditorState);
      const insertedCharacters = getInsertedCharactersFromChange(changeType, oldEditorState, newEditorState);
      const adjacentCharacters = getAdjacentCharacters(oldContent, oldSelection);
      return TRIGGER_CHARACTERS.some(c => (
        insertedCharacters.includes(c)
        || deletedCharacters.includes(c)
        || adjacentCharacters.indexOf(c) > -1)
      );

    case 'split-block':
      const startBlock = oldContent.getBlockForKey(oldSelection.getStartKey());
      const startSplitStyle = startBlock.getInlineStyleAt(oldSelection.getStartOffset());
      if (startSplitStyle.some(style => style!.startsWith('core.styling'))) {
        return true;
      }
      const endBlock = newContent.getBlockForKey(newSelection.getStartKey());
      const endSplitStyle = endBlock.getInlineStyleAt(newSelection.getStartOffset());
      if (endSplitStyle.some(style => style!.startsWith('core.styling'))) {
        return true;
      }
      return false;

    default:
      return true;
  }
};