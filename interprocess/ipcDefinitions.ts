import { ipcRenderer, ipcMain, IpcMain, IpcRenderer, IpcMessageEvent } from 'electron';
import { Note } from './types';

export type ListenerFunction<PayloadT, ResponsePayloadT, ErrorPayloadT> = (
  payload: PayloadT,
  success: (responsePayload?: ResponsePayloadT) => void,
  error: (errorPayload?: ErrorPayloadT) => void,
  event: IpcMessageEvent
) => void;

export type ResponseCallback<ResponsePayloadT, ErrorPayloadT> = (error: ErrorPayloadT | null, response: ResponsePayloadT | null, event: IpcMessageEvent) => void;

// TODO: TS 2.8 here
function createIPCDefinition<PayloadT, ResponsePayloadT, ErrorPayloadT>(requestChannel: string, successChannel?: string, errorChannel?: string) {
  return {
    send: (payload?: PayloadT, callback?: ResponseCallback<ResponsePayloadT, ErrorPayloadT>) => {
      if (callback) {
        const successCallback = (event: IpcMessageEvent, response: ResponsePayloadT) => callback(null, response, event);
        const errorCallback = (event: IpcMessageEvent, error: ErrorPayloadT) => callback(error, null, event);
        ipcRenderer.once(successChannel!, (event: IpcMessageEvent, response: ResponsePayloadT) => {
          ipcRenderer.removeListener(errorChannel || '', errorCallback);
          successCallback(event, response);
        });
        if (errorChannel) {
          ipcRenderer.once(errorChannel, (event: IpcMessageEvent, error: ErrorPayloadT) => {
            ipcRenderer.removeListener(successChannel!, successCallback);
            errorCallback(event, error);
          });
        }
      }
      ipcRenderer.send(requestChannel, payload);
    },
    addListener: (listener: ListenerFunction<PayloadT, ResponsePayloadT, ErrorPayloadT>) => {
      console.log(`Adding listener for ${requestChannel}`);
      ipcMain.addListener(requestChannel, (event: IpcMessageEvent, payload: PayloadT) => {
        listener(
          payload,
          (responsePayload?: ResponsePayloadT) => event.sender.send(successChannel!, responsePayload),
          (errorPayload?: ErrorPayloadT) => event.sender.send(errorChannel!, errorPayload),
          event
        );
      })
    }
  }
};

export const fetchNotesIPC = createIPCDefinition<void, { [key: string]: Note }, void>('fetchNotes', 'fetchedNotes');
export const updateNoteIPC = createIPCDefinition<{ id: string, patch: Partial<Note> }, void, void>('updateNote');
export const createNoteIPC = createIPCDefinition<string, void, void>('createNote');
