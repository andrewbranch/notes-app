import { DispatchProp } from 'react-redux';

export interface UnconnectedNoteListItemProps {
  noteId: string;
  isSelected: boolean;
  onDeleteNote: (id: string) => void;
}

export type NoteListItemProps = UnconnectedNoteListItemProps & {
  noteId: string;
  noteTitle: string;
}