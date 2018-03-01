import * as React from 'react';
import { match } from 'react-router';
import { connect, DispatchProp } from 'react-redux';
import { MasterDetailView } from '../ui/MasterDetailView';
import { Route, RouteComponentProps } from 'react-router-dom';
import { Note } from './Note';
import { NoteListItem } from './NoteListItem';
import mapStateToProps from './Shell.selectors';
const styles = require('./Shell.scss');

export interface ShellProps extends RouteComponentProps<{}>, DispatchProp<{}> {
  selectedNote: string;
}

/**
 * Lays out all visible components within the window
 */
export class Shell extends React.Component<ShellProps> {
  render() {
    return (
      <div className={styles.shell}>
        <MasterDetailView
          masterListItems={['1', '2', '3']}
          renderMasterListItem={(noteId, isSelected) => (
            <NoteListItem key={noteId} noteId={noteId} isSelected={isSelected} />
          )}
          selectedMasterListItem={this.props.selectedNote}
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

export default connect(mapStateToProps)(Shell);