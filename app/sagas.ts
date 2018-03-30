import { convertToRaw } from 'draft-js';
import { delay, Task } from 'redux-saga';
import { takeEvery, call, all, take, select, fork, cancel } from 'redux-saga/effects';
import { createNoteIPC, updateNoteIPC } from '../interprocess/ipcDefinitions';
import { ActionWithPayload } from './actions/helpers';
import { createNoteActionCreator } from './actions/notes';
import { updateEditor } from './components/editor/Editor.actions';
import { selectedNoteSelector } from './selectors/notes.selectors';
import { NoteTransaction } from '../interprocess/types';
import { deleteNote } from './components/Shell.actions';
import { Note } from './reducers/types';
import { performDependentEdits } from './utils/draft-utils';
import { collapseInlineStyleRangesAtSelectionEdges } from './components/editor/core-styling-plugin/steps/collapseInlineStyle';

export function* createNoteSaga(action: ActionWithPayload<NoteTransaction>) {
  yield call(createNoteIPC.send, action.payload);
}

export function* deleteNoteSaga(action: ActionWithPayload<string>) {
  yield call(updateNoteIPC.send, { id: action.payload, patch: { isDeleted: true } });
}

export function* listenForNoteUpdates() {
  // Wait for router to initialize, or everything will break
  yield take('@@router/LOCATION_CHANGE');
  yield updateNoteSaga();
}

// TODO: type this argument more safely
export function* updateNoteSaga() {
  let task: Task | null = null;
  while (true) {
    const prevSelectedNote: Note | null = yield select(selectedNoteSelector);
    yield take(updateEditor.type);
    const selectedNote: Note | null = yield select(selectedNoteSelector);
    if (task) {
      yield cancel(task);
    }

    task = yield fork(function*() {
      yield call(delay, 500);
      if (selectedNote && prevSelectedNote && prevSelectedNote !== selectedNote) {
        if (selectedNote.id === prevSelectedNote.id && selectedNote !== prevSelectedNote) {
          const { editor } = selectedNote;
          const content = editor.getCurrentContent();
          const selection = editor.getSelection();
          const prevContent = prevSelectedNote.editor.getCurrentContent();
          if (content !== prevContent) {
            yield call(updateNoteIPC.send, {
              id: selectedNote.id,
              patch: {
                content: convertToRaw(performDependentEdits(
                  editor,
                  collapseInlineStyleRangesAtSelectionEdges(content, selection)
                ).getCurrentContent()),
                updatedAt: Date.now()
              }
            });
          }
        }
      }
    });
  }
}

export function* logEditorStateSaga() {
  const note: Note = yield select(selectedNoteSelector);
  yield call({ context: console, fn: console.log }, note.editor);
  yield call({ context: console, fn: console.log }, convertToRaw(note.editor.getCurrentContent()));
}

export function* rootSaga() {
  yield all([
    takeEvery(createNoteActionCreator.type, createNoteSaga),
    takeEvery(deleteNote.type, deleteNoteSaga),
    takeEvery('dev.logEditorState', logEditorStateSaga),
    fork(listenForNoteUpdates)
  ]);
}
