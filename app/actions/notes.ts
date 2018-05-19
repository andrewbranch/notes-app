import * as uuid from 'uuid/v4';
import { createActionCreator } from './helpers';
import { RawNote } from '../reducers/types';

export type CreateNotePayload = Pick<RawNote, 'id' | 'createdAt' | 'updatedAt'>;
export const createNoteActionCreator = createActionCreator<CreateNotePayload>('notes.create');
export const createNote = () => {
  const time = Date.now();
  return createNoteActionCreator({ id: uuid(), createdAt: time, updatedAt: time });
};
