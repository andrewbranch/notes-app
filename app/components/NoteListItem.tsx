import * as React from 'react';
import * as classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { connect, DispatchProp } from 'react-redux';
import { NotesState } from '../reducers/types';
import { NoteListItemProps } from './NoteListItem.d';
import { noteListItemSelector } from './NoteListItem.selectors';
const styles = require('./NoteListItem.scss');
const cx = classNames.bind(styles);

export class NoteListItem extends React.PureComponent<NoteListItemProps> {
  render() {
    const { noteId, isSelected, noteTitle } = this.props;
    return (
      <Link to={'/' + noteId} className={cx(styles.noteListItem, { selected: isSelected })}>
        <div className={styles.title}>
          {noteTitle}
        </div>
      </Link>
    );
  }
}

export default connect(noteListItemSelector)(NoteListItem);