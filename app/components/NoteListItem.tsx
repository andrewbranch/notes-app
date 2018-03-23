import * as React from 'react';
import * as classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { NoteListItemProps } from './NoteListItem.d';
import { noteListItemSelector } from './NoteListItem.selectors';
const styles = require('./NoteListItem.scss');
const cx = classNames.bind(styles);

export class NoteListItem extends React.PureComponent<NoteListItemProps> {
  private onClick: React.MouseEventHandler<HTMLElement> = () => {
    this.props.dispatch!(push(`/${this.props.noteId}`));
  }

  render() {
    const { noteId, isSelected, noteTitle, dispatch, ...props } = this.props;
    return (
      <div
        {...props}
        tabIndex={undefined}
        onClick={this.onClick}
        className={cx(styles.noteListItem, { selected: isSelected })}
      >
        <div className={styles.title}>
          {noteTitle}
        </div>
      </div>
    );
  }
}

export default connect(noteListItemSelector)(NoteListItem);