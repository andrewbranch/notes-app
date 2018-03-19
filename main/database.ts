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
let notesCollection: RxDB.RxCollection<Note>;
let notesResult: RxDB.RxDocument<Note>[];

export function extractNote(noteDocument: RxDB.RxDocument<Note>): Note {
  const { id, title, content } = noteDocument;
  return { id, title, content };
}

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

  notesCollection = await db.collection({
    name: 'notes',
    schema: noteSchema
  });

  await seedNotes(notesCollection);

  // Load initial collection
  loadNotes();

  // Pre-load any updates
  notesCollection.$.subscribe(() => {
    loadNotes();
  });

  return db;
}

async function loadNotes() {
  notesResult = await notesCollection.find({}).exec();
}

export function getNotes() {
  return notesResult;
}