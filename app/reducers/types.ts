import { EditorState, RawDraftContentState } from 'draft-js';
import { RouterState } from 'react-router-redux';
import { WindowState } from './window';
import { DataTransferState } from './dataTransfer';

export type DataTransferStatus = 'pending' | 'error' | 'complete';

export interface RawNote {
  id: string;
  content: RawDraftContentState;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  editor?: EditorState;
}

export interface Note extends RawNote {
  title: string;
  editor: EditorState;
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
