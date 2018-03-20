import { DispatchProp } from 'react-redux';

export interface UnconnectedNoteListItemProps {
  noteId: string;
  isSelected: boolean;
}

export interface NoteListItemProps extends UnconnectedNoteListItemProps, DispatchProp<{}> {
  noteId: string;
  noteTitle: string;
}