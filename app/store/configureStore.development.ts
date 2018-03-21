import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as Mousetrap from 'mousetrap';
import { createHashHistory } from 'history';
import { routerMiddleware, push } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import { toggleEditorDebugger } from '../actions/window';
import { rootSaga } from '../sagas';
import rootReducer from '../reducers';

declare const window: Window & {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?(a: any): void;
};

declare const module: NodeModule & {
  hot?: {
    accept(...args: any[]): any;
  }
};

const actionCreators = { push };

const logger = (<any>createLogger)({
  level: 'info',
  collapsed: true
});

const history = createHashHistory();
const router = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
const composeEnhancers: typeof compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
    actionCreators
  }) as any :
  compose;

const enhancer = composeEnhancers(
  applyMiddleware(router, sagaMiddleware, logger)
);

export = {
  history,
  configureStore(initialState: Object | void) {
    const store = createStore(rootReducer, initialState, enhancer);
    sagaMiddleware.run(rootSaga);

    if (module.hot) {
      module.hot.accept('../reducers', () =>
        store.replaceReducer(require('../reducers'))
      );
    }

    Mousetrap.bind('command+shift+d', event => {
      event.preventDefault();
      store.dispatch(toggleEditorDebugger());
    });

    return store;
  }
};
