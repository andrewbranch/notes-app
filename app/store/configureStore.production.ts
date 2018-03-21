import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';
import { rootSaga } from '../sagas';

const sagaMiddleware = createSagaMiddleware();
const history = createBrowserHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(router, sagaMiddleware);
sagaMiddleware.run(rootSaga);

export = {
  history,
  configureStore(initialState: Object | void) {
    return createStore(rootReducer, initialState, enhancer);
  }
};
