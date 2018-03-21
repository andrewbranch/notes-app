import * as uuid from 'uuid/v4';
import { createActionCreator } from './helpers';

export const createNoteActionCreator = createActionCreator<string>('notes.create');
export const createNote = () => createNoteActionCreator(uuid());
