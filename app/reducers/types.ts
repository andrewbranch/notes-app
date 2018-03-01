import { RouterState } from 'react-router-redux';
import { NotesState } from './notes';

export type StateShape = {
  routing: RouterState;
  notes: NotesState;
};
