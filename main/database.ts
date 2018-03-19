// @ts-check

import * as RxDB from 'rxdb';
import * as leveldb from 'pouchdb-adapter-leveldb';
import * as path from 'path';
import * as fs from 'fs';
import leveldown from 'leveldown';
import { promisify } from 'util';
import { app } from 'electron';
import { Note } from './types';

const appDataPath = path.resolve(app.getPath('appData'), 'Notes App');
const sampleNoteContent = {"blocks":[{"key":"3cq7l","text":"Let’s try saving this document note to a database.","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":22,"length":8,"style":"core.styling.strikethrough"},{"offset":41,"length":8,"style":"core.styling.italic"}],"entityRanges":[],"data":{}},{"key":"1tmgr","text":"Neat-o!","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":7,"style":"core.styling.bold"}],"entityRanges":[],"data":{}},{"key":"89ujc","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}};
const pathExists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

const notesSchema: RxDB.RxJsonSchema = {
  version: 0,
  title: 'notes schema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    title: {
      type: 'string'
    },
    content: {
      type: 'object'
    }
  },
  required: ['title', 'content']
}

export async function initDatabase() {
  // RxDB.plugin(leveldb);

  // if (!await pathExists(appDataPath)) {
  //   await mkdir(appDataPath);
  // }

  // const db = await RxDB.create({
  //   name: path.resolve(appDataPath, 'database'),
  //   adapter: leveldown,
  //   multiInstance: false
  // });

  // const notes: RxDB.RxCollection<Note> = await db.collection({
  //   name: 'notes',
  //   schema: notesSchema
  // });

  // await notes.insert({
  //   title: 'Sample Note',
  //   content: sampleNoteContent
  // });
}
