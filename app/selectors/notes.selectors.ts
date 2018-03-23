import createCachedSelector from 're-reselect';
import { sortBy } from 'lodash';
import { createSelector } from 'reselect';
import { EditorState, convertFromRaw } from 'draft-js';
import { StateShape } from '../reducers';
import { selectedNoteIdSelector } from './routing.selectors';
import { Note, RawNote } from '../reducers/types';
import { getNoteTitle } from '../utils/getNoteTitle';

export const notesSelector = (state: StateShape) => state.notes;
export const noteIdsSelector = createSelector(notesSelector, notes => Object.keys(notes));
export const notDeletedNoteIdsSelector = createSelector(
  notesSelector,
  noteIdsSelector,
  (notes, noteIds) => noteIds.filter(id => !notes[id].isDeleted)
);

export const sortedNoteIdsSelector = createSelector(
  notesSelector,
  notDeletedNoteIdsSelector,
  (notes, noteIds) => sortBy(noteIds, id => -notes[id].updatedAt)
);

export const selectedRawNoteSelector = createSelector(
  notesSelector,
  selectedNoteIdSelector,
  (notes, selectedNoteId) => (
    selectedNoteId ? notes[selectedNoteId] : null
  )
);

export const rawNoteSelector = createCachedSelector(
  notesSelector,
  (state: StateShape, noteId: string) => noteId,
  (notes, noteId): RawNote => notes[noteId]
)(
  (state, noteId) => noteId
);

export const noteTitleSelector = createCachedSelector(
  rawNoteSelector,
  note => getNoteTitle(note.editor ? note.editor.getCurrentContent() : note.content)
)(
  (state, noteId) => noteId
);

const noteEditorSelector = createCachedSelector(
  rawNoteSelector,
  note => (
    note.editor || EditorState.createWithContent(convertFromRaw(note.content))
  )
)(
  (state, noteId) => noteId
);

export const noteSelector = createCachedSelector(
  rawNoteSelector,
  noteTitleSelector,
  noteEditorSelector,
  (note, title, editor): Note => ({ ...note, title, editor })
)(
  (state, noteId) => noteId
);

export const selectedNoteSelector = createSelector(
  (state: StateShape) => state,
  noteIdsSelector,
  selectedNoteIdSelector,
  (state, noteIds, selectedNoteId) => noteIds.length && selectedNoteId ? noteSelector(state, selectedNoteId) : null
);
