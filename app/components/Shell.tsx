import * as React from 'react';
import JSONTree from 'react-json-tree';
import { match } from 'react-router';
import { replace, push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { connect, DispatchProp } from 'react-redux';
import { convertToRaw } from 'draft-js';
import { Route, RouteComponentProps } from 'react-router-dom';
import { MasterDetailView } from '../ui/MasterDetailView';
import { Note as NoteType, DataTransferStatus } from '../reducers/types';
import Note from './Note';
import NoteListItem from './NoteListItem';
import { shellSelector } from './Shell.selectors';
import { deleteNote } from './Shell.actions';
const styles = require('./Shell.scss');

export interface ShellProps extends RouteComponentProps<{}>, DispatchProp<{}> {
  selectedNote: NoteType | null;
  noteIds: string[];
  showEditorDebugger: boolean;
  loadedNotesStatus: DataTransferStatus;
}

/**
 * Lays out all visible components within the window
 */
export class Shell extends React.Component<ShellProps> {
  private selectAdjacentNote(offset: 1 | -1): boolean {
    const { dispatch, noteIds, selectedNote } = this.props;
    if (selectedNote) {
      const noteIndex = noteIds.indexOf(selectedNote.id);
      const previousNoteId = noteIds[noteIndex + offset];
      if (previousNoteId) {
        dispatch!(push(`/${previousNoteId}`));
      }
      return true;
    }

    return false;
  }

  private selectPreviousNote = () => {
    const { dispatch, noteIds } = this.props;
    if (!this.selectAdjacentNote(-1) && noteIds.length) {
      dispatch!(push(`/${noteIds[noteIds.length - 1]}`));
    }
  }

  private selectNextNote = () => {
    const { dispatch, noteIds } = this.props;
    if (!this.selectAdjacentNote(1) && noteIds.length) {
      dispatch!(push(`/${noteIds[0]}`));
    }
  }

  private onMasterViewKeyDown: React.KeyboardEventHandler<HTMLElement> = event => {
    if (event.key === 'Backspace' && this.props.selectedNote) {
      this.deleteNote(this.props.selectedNote.id);
    }
  }

  private deleteNote = (noteId: string) => {
    const { dispatch, noteIds } = this.props;
    const noteIndex = noteIds.indexOf(noteId);
    const nextNoteId = noteIds[noteIndex + 1] || noteIds[noteIndex - 1];
    const nextPath = nextNoteId ? `/${nextNoteId}` : '/';
    // TODO: batch these two actions somehow
    dispatch!(replace(nextPath));
    dispatch!(deleteNote(noteId));
  }

  render() {
    const { selectedNote, noteIds, showEditorDebugger, loadedNotesStatus } = this.props;

    return (
      <div className={styles.shell}>
        {loadedNotesStatus === 'complete' ? ([
          <MasterDetailView
            key="master-detail-view"
            highlightOnFocus
            className={styles.masterDetailView}
            masterListItems={noteIds}
            onUpArrow={this.selectPreviousNote}
            onDownArrow={this.selectNextNote}
            onUnhandledMasterViewKeyDown={this.onMasterViewKeyDown}
            renderMasterListItem={(props, noteId, isSelected) => (
              <NoteListItem {...props} key={noteId} noteId={noteId} isSelected={isSelected} />
            )}
            selectedMasterListItem={selectedNote ? selectedNote.id : null}
            renderDetailView={props => (
              <Route path="/:id" render={() => (
                <MasterDetailView.DetailView {...props}>
                  {selectedNote ? <Note noteId={selectedNote.id} /> : null}
                </MasterDetailView.DetailView>
              )} />
            )}
          />,
          showEditorDebugger ? (
            <div key="debug-pane" className={styles.debugPane}>
              <JSONTree data={selectedNote ? convertToRaw(selectedNote.editor.getCurrentContent()) : {}} />
            </div>
          ) : null
        ]) : null}
      </div>
    );
  }
}

export default connect(shellSelector)(Shell);