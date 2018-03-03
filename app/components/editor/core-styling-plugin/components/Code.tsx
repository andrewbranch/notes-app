import * as React from 'react';
const styles = require('./core-styling.scss');

export class Code extends React.PureComponent {
  render() {
    return <span className={styles.code}>{this.props.children}</span>;
  }
}