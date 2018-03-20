import { noteTitleSelector } from '../selectors/notes.selectors';
import { StateShape } from '../reducers';
import { UnconnectedNoteListItemProps } from './NoteListItem.d';

export const noteListItemSelector = (state: StateShape, props: UnconnectedNoteListItemProps) => ({
  noteTitle: noteTitleSelector(state, props.noteId)
});
