import * as RxDB from 'rxdb';
import { DBNote } from '../interprocess/types';
import { RawDraftContentState } from 'draft-js';
const sampleNoteContent = {"blocks":[{"key":"3cq7l","text":"Let’s try saving this document note to a database.","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":22,"length":8,"style":"core.styling.strikethrough"},{"offset":41,"length":8,"style":"core.styling.italic"}],"entityRanges":[],"data":{}},{"key":"1tmgr","text":"Neat-o!","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":7,"style":"core.styling.bold"}],"entityRanges":[],"data":{}},{"key":"89ujc","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}};

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
