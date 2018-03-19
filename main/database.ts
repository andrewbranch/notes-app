// @ts-check

import * as RxDB from 'rxdb';
import * as leveldb from 'pouchdb-adapter-leveldb';

RxDB.plugin(leveldb);

export async function initDatabase() {
  const db = await RxDB.create({ name: 'NotesApp', adapter: leveldb });
}
