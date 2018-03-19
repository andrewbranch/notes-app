import * as React from 'react';
import { Store } from 'react-redux';
import { render } from 'react-dom';
import { values } from 'lodash';
import { AppContainer } from 'react-hot-loader';
import { Root } from './components/Root';
import { initIPC } from './ipc';
import * as sideEffects from './sideEffects';
import './app.global.scss';
import { StateShape } from './reducers';

const { configureStore, history } = require('./store/configureStore');
const store: Store<StateShape> = configureStore();
initIPC(store);

let state = store.getState();
store.subscribe(() => {
  const newState = store.getState();
  values(sideEffects).forEach(sideEffect => {
    sideEffect(newState, state);
  });

  state = newState;
});

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
