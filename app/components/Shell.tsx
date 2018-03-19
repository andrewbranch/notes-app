import * as React from 'react';
import JSONTree from 'react-json-tree';
import { match } from 'react-router';
import { connect, DispatchProp } from 'react-redux';
import { Route, RouteComponentProps } from 'react-router-dom';
import { MasterDetailView } from '../ui/MasterDetailView';
import { Note as NoteType } from '../reducers/types';
import Note from './Note';
import NoteListItem from './NoteListItem';
import { shellSelector } from './Shell.selectors';
import { convertToRaw } from 'draft-js';
const styles = require('./Shell.scss');

export interface ShellProps extends RouteComponentProps<{}>, DispatchProp<{}> {
  selectedNote: NoteType | null;
  noteIds: string[];
  showEditorDebugger: boolean;
}

/**
 * Lays out all visible components within the window
 */
export class Shell extends React.Component<ShellProps> {
  render() {
    const { selectedNote, noteIds, showEditorDebugger } = this.props;

    return (
      <div className={styles.shell}>
        <MasterDetailView
          className={styles.masterDetailView}
          masterListItems={noteIds}
          renderMasterListItem={(noteId, isSelected) => (
            <NoteListItem key={noteId} noteId={noteId} isSelected={isSelected} />
          )}
          selectedMasterListItem={selectedNote ? selectedNote.id : null}
          detailView={
            <Route path="/:id" render={({ match }: { match: match<{ id: string }> }) => (
              <MasterDetailView.DetailView>
                <Note noteId={match.params.id} />
              </MasterDetailView.DetailView>
            )} />
          }
        />
        {showEditorDebugger ? (
          <div className={styles.debugPane}>
            <JSONTree data={selectedNote ? convertToRaw(selectedNote.editor.getCurrentContent()) : {}} />
          </div>
        ) : null}
      </div>
    );
  }
}

export default connect(shellSelector)(Shell);