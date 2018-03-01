import * as React from 'react';
import { match } from 'react-router';
import { MasterDetailView } from '../ui/MasterDetailView';
import { Link, Route } from 'react-router-dom';
import { Note } from './Note';
const styles = require('./Shell.scss');

/**
 * Lays out all visible components within the window
 */
export class Shell extends React.Component {
  render() {
    return (
      <div className={styles.shell}>
        <MasterDetailView
          masterListItems={['1', '2', '3']}
          renderMasterListItem={(item, isSelected) => <div key={item}><Link to={`/${item}`}>{item}</Link></div>}
          selectedMasterListItem={'1'}
          detailView={
            <Route path="/:id">
              {({ match }: { match: match<{ id: string }> }) => (
                <MasterDetailView.DetailView>
                  <Note noteId={match.params.id} />
                </MasterDetailView.DetailView>
              )}
            </Route>
          }
        />
      </div>
    );
  }
}

