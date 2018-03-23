import { ipcRenderer, ipcMain, IpcMessageEvent } from 'electron';
import { DBNote, NoteTransaction } from './types';

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
    send: (payload?: PayloadT) => {
      return new Promise<ResponsePayloadT | null>((resolve, reject) => {
        if (successChannel) {
          const successCallback = (event: IpcMessageEvent, response: ResponsePayloadT) => resolve(response);
          const errorCallback = (event: IpcMessageEvent, error: ErrorPayloadT) => reject(error);
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
        if (!successChannel) resolve(null);
      });
    },
    addListener: (listener: ListenerFunction<PayloadT, ResponsePayloadT, ErrorPayloadT>) => {
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

export const fetchNotesIPC = createIPCDefinition<void, { [key: string]: DBNote }, void>('fetchNotes', 'fetchedNotes');
export const updateNoteIPC = createIPCDefinition<NoteTransaction, void, void>('updateNote');
export const createNoteIPC = createIPCDefinition<NoteTransaction, void, void>('createNote');
