import { RouterState } from 'react-router-redux';
import { NotesState } from './notes';
import { WindowState } from './window';

export type StateShape = {
  routing: RouterState;
  notes: NotesState;
  window: WindowState;
};
