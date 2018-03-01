import * as React from 'react';
import * as classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
const styles = require('./NoteListItem.scss');
const cx = classNames.bind(styles);

export interface NoteListItemProps {
  noteId: string;
  isSelected: boolean;
}

export class NoteListItem extends React.PureComponent<NoteListItemProps> {
  render() {
    const { noteId, isSelected } = this.props;
    return (
      <Link to={'/' + noteId} className={cx(styles.noteListItem, { selected: isSelected })}>
        {noteId}
      </Link>
    );
  }
}