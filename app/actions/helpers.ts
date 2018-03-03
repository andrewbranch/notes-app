import { Action } from 'redux';

export interface ActionWithPayload<T> extends Action {
  readonly payload: T;
}

interface ActionCreator<T> {
  readonly type: string;
  (payload?: T): ActionWithPayload<T>;
  test(action: Action): action is ActionWithPayload<T>;
}

export const createActionCreator = <T>(type: string): ActionCreator<T> => (
  Object.assign((payload?: T): any => ({ type, payload }), {
    type,
    test: (action: Action): action is ActionWithPayload<T> => action.type === type
  })
);
