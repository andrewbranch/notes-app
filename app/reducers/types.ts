import { EditorState, RawDraftContentState } from 'draft-js';
import { RouterState } from 'react-router-redux';
import { WindowState } from './window';

export interface Note {
  id: string;
  title: string;
  content: RawDraftContentState;
  editor: EditorState;
}

export type LazyNote = Pick<Note, 'id' | 'title' | 'content'> & {
  editor?: EditorState;
}

export type NotesState = {
  [key: string]: LazyNote;
};

export type StateShape = {
  routing: RouterState;
  notes: NotesState;
  window: WindowState;
};
