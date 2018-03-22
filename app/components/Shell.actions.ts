import { createActionCreator } from '../actions/helpers';

export const deleteNote = createActionCreator<string>('notes.delete');
