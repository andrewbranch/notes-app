import { createActionCreator } from './helpers';
import { NotesState } from '../reducers/types';

export const loadNotes = createActionCreator<NotesState>('ipc.loadNotes');
