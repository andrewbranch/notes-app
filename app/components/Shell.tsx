import * as React from 'react';
import { match } from 'react-router';
import { connect, DispatchProp } from 'react-redux';
import { MasterDetailView } from '../ui/MasterDetailView';
import { Route, RouteComponentProps } from 'react-router-dom';
import Note from './Note';
import NoteListItem from './NoteListItem';
import { shellSelector } from './Shell.selectors';
const styles = require('./Shell.scss');

export interface ShellProps extends RouteComponentProps<{}>, DispatchProp<{}> {
  selectedNote: string;
  noteIds: string[];
}

/**
 * Lays out all visible components within the window
 */
export class Shell extends React.Component<ShellProps> {
  render() {
    const { selectedNote, noteIds } = this.props;

    return (
      <div className={styles.shell}>
        <MasterDetailView
          masterListItems={noteIds}
          renderMasterListItem={(noteId, isSelected) => (
            <NoteListItem key={noteId} noteId={noteId} isSelected={isSelected} />
          )}
          selectedMasterListItem={selectedNote}
          detailView={
            <Route path="/:id" render={({ match }: { match: match<{ id: string }> }) => (
              <MasterDetailView.DetailView>
                <Note noteId={match.params.id} />
              </MasterDetailView.DetailView>
            )} />
          }
        />
      </div>
    );
  }
}

export default connect(shellSelector)(Shell);