import { RawDraftContentState } from 'draft-js';

export interface DBNote {
  id: string;
  content: RawDraftContentState;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
}

export type NoteTransaction = {
  id: string,
  patch: Partial<DBNote>
};
