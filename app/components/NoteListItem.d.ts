import * as React from 'react';
import { DispatchProp } from 'react-redux';

export interface UnconnectedNoteListItemProps extends React.HTMLAttributes<HTMLElement> {
  noteId: string;
  isSelected: boolean;
}

export type NoteListItemProps = UnconnectedNoteListItemProps & DispatchProp<{}> & {
  noteId: string;
  noteTitle: string;
}