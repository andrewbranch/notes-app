import * as Mousetrap from 'mousetrap';
import { ActionCreator } from 'react-redux';
import { isMacOS } from './utils/platform';
import { createNote } from './actions/notes';
import { StateShape } from './reducers';
import { Store } from 'redux';
import { createActionCreator } from './actions/helpers';

// @ts-ignore: Mousetrap bindGlobal extension https://github.com/ccampbell/mousetrap/blob/master/plugins/global-bind/mousetrap-global-bind.js
!function(t){var o={},a=t.prototype.stopCallback;t.prototype.stopCallback=function(t,n,r,i){var e=this;return!!e.paused||!o[r]&&!o[i]&&a.call(e,t,n,r)},t.prototype.bindGlobal=function(t,a,n){if(this.bind(t,a,n),t instanceof Array)for(var r=0;r<t.length;r++)o[t[r]]=!0;else o[t]=!0},t.init()}(Mousetrap);
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

const devKeybindings = process.env.NODE_ENV === 'production' ? [] : [
  keybinding({
    title: 'Log current editorState',
    key: meta('shift+e'),
    action: createActionCreator('dev.logEditorState')
  })
];

export const attachKeyboardHandlers = ({ dispatch, getState }: Store<StateShape>) => {
  keybindings.concat(devKeybindings).forEach(keybinding => {
    Mousetrap.bindGlobal(keybinding.key, event => {
      dispatch(keybinding.action(keybinding.createPayload ? keybinding.createPayload(getState(), event) : undefined));
    });
  });
}
