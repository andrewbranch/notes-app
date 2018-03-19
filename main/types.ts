import { RawDraftContentState } from 'draft-js';

export interface Note {
  id: string;
  title: string;
  content: RawDraftContentState;
}