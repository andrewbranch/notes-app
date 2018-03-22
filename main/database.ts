import * as RxDB from 'rxdb';
import * as leveldb from 'pouchdb-adapter-leveldb';
import * as path from 'path';
import * as fs from 'fs';
import leveldown from 'leveldown';
import { promisify } from 'util';
import { app } from 'electron';
import { DBNote } from '../interprocess/types';
import { noteSchema } from './noteSchema';
import { seedNotes } from './seed';
import { emptyContentState } from '../interprocess/seed';

const appDataPath = path.resolve(app.getPath('appData'), 'Notes App');
const mkdir = promisify(fs.mkdir);
let notesCollection: RxDB.RxCollection<DBNote>;
let notesResult: RxDB.RxDocument<DBNote>[];

export function extractNote(noteDocument: RxDB.RxDocument<DBNote>): DBNote {
  const { id, content, isDeleted, createdAt, updatedAt } = noteDocument;
  return { id, content, isDeleted, createdAt, updatedAt };
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

export async function saveNote(id: string, patch: Partial<DBNote>) {
  return notesCollection.findOne({ id }).update({
    $set: { updatedAt: Date.now(), ...patch }
  });
}

// TODO: TS 2.8 Omit type
export async function createNote(note: Partial<DBNote>) {
  const time = Date.now();
  return notesCollection.insert({
    content: emptyContentState,
    createdAt: time,
    updatedAt: time,
    ...note
  });
}
