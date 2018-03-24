import * as RxDB from 'rxdb';
import { DBNote } from '../interprocess/types';
import { RawDraftContentState } from 'draft-js';
const sampleNoteContent = {"blocks":[{"key":"3cq7l","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}};

export async function seedNotes(notes: RxDB.RxCollection<DBNote>): Promise<void> {
  if (!await notes.findOne({ id: 'seed-1' }).exec()) {
    await notes.insert({
      id: 'seed-1',
      content: sampleNoteContent as RawDraftContentState,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
}
