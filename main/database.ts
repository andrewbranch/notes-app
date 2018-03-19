import * as RxDB from 'rxdb';
import * as leveldb from 'pouchdb-adapter-leveldb';
import * as path from 'path';
import * as fs from 'fs';
import leveldown from 'leveldown';
import { promisify } from 'util';
import { app } from 'electron';
import { Note } from './types';
import { noteSchema } from './noteSchema';
import { seedNotes } from './seed';

const appDataPath = path.resolve(app.getPath('appData'), 'Notes App');
const mkdir = promisify(fs.mkdir);

export async function initDatabase() {
  RxDB.plugin(leveldb);
  fs.exists(appDataPath, async exists => {
    if (!exists) {
      try {
        await mkdir(appDataPath);
      } catch (error) {
        console.trace(error);
        app.quit();
      }
    }
  });

  const db = await RxDB.create({
    name: path.resolve(appDataPath, 'database'),
    adapter: leveldown,
    multiInstance: false
  });

  const notes: RxDB.RxCollection<Note> = await db.collection({
    name: 'notes',
    schema: noteSchema
  });

  await seedNotes(notes);

  return db;
}
