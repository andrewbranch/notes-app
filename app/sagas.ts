import { EditorState, convertToRaw } from 'draft-js';
import { delay } from 'redux-saga';
import { takeEvery, call, all, take, select, fork, cancel } from 'redux-saga/effects';
import { createNoteIPC, updateNoteIPC } from '../interprocess/ipcDefinitions';
import { ActionWithPayload } from './actions/helpers';
import { createNoteActionCreator } from './actions/notes';
import { updateEditor } from './components/editor/Editor.actions';
import { selectedNoteSelector } from './selectors/notes.selectors';
import { Task } from 'redux-saga';

export function* createNoteSaga(action: ActionWithPayload<string>) {
  yield call(createNoteIPC.send, action.payload);
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
    const prevSelectedNote = yield select(selectedNoteSelector);
    const action: ActionWithPayload<{ noteId: string, editorState: EditorState }> = yield take(updateEditor.type);
    const selectedNote = yield select(selectedNoteSelector);
    if (task) {
      yield cancel(task);
    }

    task = yield fork(function*() {
      yield call(delay, 500);
      if (selectedNote && prevSelectedNote && prevSelectedNote !== selectedNote) {
        if (selectedNote.id === prevSelectedNote.id && selectedNote !== prevSelectedNote) {
          const { editor } = selectedNote;
          const content = editor.getCurrentContent();
          const prevContent = prevSelectedNote.editor.getCurrentContent();
          const patch = {
            ...(content !== prevContent ? { content: convertToRaw(content) } : {})
          };

          if (Object.keys(patch).length) {
            yield call(updateNoteIPC.send, { id: selectedNote.id, patch });
          }
        }
      }
    });
  }
}

export function* rootSaga() {
  yield all([
    takeEvery(createNoteActionCreator.type, createNoteSaga),
    fork(listenForNoteUpdates)
  ]);
}
