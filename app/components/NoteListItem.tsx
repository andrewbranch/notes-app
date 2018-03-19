import * as React from 'react';
import * as classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { connect, DispatchProp } from 'react-redux';
import { NotesState } from '../reducers/types';
import { noteListItemSelector } from './NoteListItem.selectors';
const styles = require('./NoteListItem.scss');
const cx = classNames.bind(styles);

export interface NoteListItemProps extends DispatchProp<{}> {
  noteId: string;
  isSelected: boolean;
  notes: NotesState;
}

export class NoteListItem extends React.PureComponent<NoteListItemProps> {
  render() {
    const { noteId, isSelected, notes } = this.props;
    const note = notes[noteId];
    return (
      <Link to={'/' + noteId} className={cx(styles.noteListItem, { selected: isSelected })}>
        {note.title}
      </Link>
    );
  }
}

export default connect(noteListItemSelector)(NoteListItem);