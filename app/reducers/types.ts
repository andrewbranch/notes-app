import { EditorState, RawDraftContentState } from 'draft-js';
import { RouterState } from 'react-router-redux';
import { WindowState } from './window';
import { DataTransferState } from './dataTransfer';

export type DataTransferStatus = 'pending' | 'error' | 'complete';

export interface Note {
  id: string;
  title: string;
  content: RawDraftContentState;
  editor: EditorState;
}

export type RawNote = Pick<Note, 'id' | 'content'> & {
  editor?: EditorState;
}

export type NotesState = {
  [key: string]: RawNote;
};

export type StateShape = {
  routing: RouterState;
  notes: NotesState;
  window: WindowState;
  dataTransfer: DataTransferState;
};
