import * as Mousetrap from 'mousetrap';
import { Dispatch, ActionCreator } from 'react-redux';
import { isMacOS } from './utils/platform';
import { createNote } from './actions/notes';
import { StateShape } from './reducers';
import { Store } from 'redux';

const meta = (key: string) => `${isMacOS ? 'command' : 'ctrl'}+${key}`;


export type Keybinding<T> = {
  title: string;
  description?: string;
  key: string;
  action: ActionCreator<T>;
  createPayload?: (state: StateShape, event: KeyboardEvent | undefined) => T;
}

// Just an easy way to enforce correct typings while constructing a heterogeneous array
const keybinding = <T>(keybinding: Keybinding<T>) => keybinding;

export const keybindings: Keybinding<any>[] = [
  keybinding({
    title: 'New note',
    key: meta('n'),
    action: createNote
  })
];

export const attachKeyboardHandlers = ({ dispatch, getState }: Store<StateShape>) => {
  keybindings.forEach(keybinding => {
    Mousetrap.bind(meta('n'), event => {
      dispatch(keybinding.action(keybinding.createPayload ? keybinding.createPayload(getState(), event) : undefined));
    });
  });
}