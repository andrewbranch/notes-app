import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { noteSelector } from './Note.selectors';
import { NotesState } from '../reducers/notes';
const styles = require('./Note.scss');

export interface NoteProps extends DispatchProp<{}> {
  noteId: string;
  notes: NotesState;
}

export class Note extends React.Component<NoteProps> {
  render() {
    const note = this.props.notes[this.props.noteId];

    return (
      <div className={styles.note}>
        {note.content}
      </div>
    );
  }
}

export default connect(noteSelector)(Note);
