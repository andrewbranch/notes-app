import * as React from 'react';
import { Store } from 'react-redux';
import { render } from 'react-dom';
import { values } from 'lodash';
import { AppContainer } from 'react-hot-loader';
import { Root } from './components/Root';
import { initIPC } from './ipc';
import './app.global.scss';
import { StateShape } from './reducers';
import { attachKeyboardHandlers } from './keybindings';

const { configureStore, history } = require('./store/configureStore');
const store: Store<StateShape> = configureStore();
initIPC(store);
attachKeyboardHandlers(store);

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if ((module as any).hot) {
  (module as any).hot.accept('./components/Root', () => {
    const NextRoot = require('./components/Root').default;
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
