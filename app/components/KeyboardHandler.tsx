import * as React from 'react';
import * as Mousetrap from 'mousetrap';
import { isMacOS } from '../utils/platform';
import { DispatchProp, connect } from 'react-redux';
import { createNote } from '../actions/notes';

const meta = (key: string) => `${isMacOS ? 'command' : 'ctrl'}+${key}`;

export interface KeyboardHandlerProps extends DispatchProp<{}> {
  children: JSX.Element;
}

export class KeyboardHandler extends React.PureComponent<KeyboardHandlerProps> {
  componentDidMount() {
    const { dispatch } = this.props;
    Mousetrap.bind(meta('n'), () => dispatch!(createNote()));
  }

  render() {
    return this.props.children;
  }
}

export default connect(() => ({}))(KeyboardHandler);