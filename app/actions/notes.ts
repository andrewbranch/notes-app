import * as uuid from 'uuid/v4';
import { createActionCreator } from './helpers';
import { NoteTransaction } from '../../interprocess/types';
import { RawNote } from '../reducers/types';

export const createNoteActionCreator = createActionCreator<Pick<RawNote, 'id' | 'createdAt' | 'updatedAt'>>('notes.create');
export const createNote = () => {
  const time = Date.now();
  return createNoteActionCreator({ id: uuid(), createdAt: time, updatedAt: time });
};

export const deleteNote = createActionCreator<string>('deleteNote');
