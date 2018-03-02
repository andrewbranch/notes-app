import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { noteSelector } from './Note.selectors';
import { NotesState } from '../reducers/notes';
import Editor from './Editor';
const styles = require('./Note.scss');

export interface NoteProps extends DispatchProp<{}> {
  noteId: string;
  notes: NotesState;
}

export class Note extends React.Component<NoteProps> {
  render() {
    return (
      <div className={styles.note}>
        <Editor />
      </div>
    );
  }
}

export default connect(noteSelector)(Note);
