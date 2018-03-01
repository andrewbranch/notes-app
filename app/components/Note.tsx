import * as React from 'react';
const styles = require('./Note.scss');

export interface NoteProps {
  noteId: string;
}

export class Note extends React.Component<NoteProps> {
  render() {
    return (
      <div className={styles.note}>
        {this.props.noteId}
      </div>
    );
  }
}