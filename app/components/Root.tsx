import * as React from 'react';
import * as Redux from 'react-redux';
import { History } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { Switch, Route } from 'react-router';
import Shell from './Shell';
import KeyboardHandler from './KeyboardHandler';

interface RootProps {
  store: Redux.Store<any>;
  history: History
};

export const Root: React.SFC<RootProps> = ({ store, history }) => (
  <Provider store={store}>
    <KeyboardHandler>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/" component={Shell} />
        </Switch>
      </ConnectedRouter>
    </KeyboardHandler>
  </Provider>
);
