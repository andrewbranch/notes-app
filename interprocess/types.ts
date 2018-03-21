import { RawDraftContentState } from 'draft-js';

export interface Note {
  id: string;
  content: RawDraftContentState;
}