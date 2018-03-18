import { Reducer } from 'redux';
import { EditorState, ContentState } from 'draft-js';
import { updateEditor } from '../components/editor/Editor.actions';

export interface Note {
  id: string;
  title: string;
  editor: EditorState;
}

export type NotesState = {
  [key: string]: Note;
};

const initialState: NotesState = {
  1: {
    id: '1',
    title: 'Volume control',
    editor: EditorState.createWithContent(
      ContentState.createFromText('- [x] IR repeat\n- [ ] Analog design\n    - [ ] Design summer\n    - [ ] Eliminate digi pot noise\n    - [ ] Lower distortion at low volumes\n    - [ ] Tune gain\n    - [ ] Research balancing output\n- [ ] IR blaster\n    - [ ] Research parts\n    - [ ] Order parts\n    - [ ] Measure power button code\n')
    )
  },
  2: {
    id: '2',
    title: 'Notes app',
    editor: EditorState.createWithContent(
      ContentState.createFromText('Goals (High-Level)\n* Useful for developers\n* Focused, uncluttered design\n* Extensible\n* Offline\n* Performant\n* Cross-device\n* Users own data\n\nGoals (Specific)\n* Write in Markdown and see it rendered immediately (like Dropbox Paper, Canvas)\n* Command palette like VS Code or Atom for mouse-free operation\n* File-based settings like VS Code or Atom\n* Customizable keyboard shortcuts mappable to every action\n* Doesn’t (only) run in a browser\n* Raw note data is consumable (easy to access, easy to understand)\n* Doesn’t crap out on really long notes\n* Has a rich theming/extension API\n* Optional sync service can be easily “self-hosted” (single file database uploaded to cloud storage provider? Git?) or eventually, encrypted and cloud hosted\n\nTechnology\n* Electron (later, Electrino?)\n* TypeScript\n* React\n* Draft.js\n\nFirst proof-of-concept\n* Stage 1\n    * Electron shell\n    * Master/detail view\n    * Default Draft editor in detail view\n* Stage 2\n    * Canvas-like Markdown editing\n    * Line actions\n    * Notes are persistent\n')
    )
  },
  3: {
    id: '3',
    title: 'Argus Argoflex',
    editor: EditorState.createWithContent(
      ContentState.createFromText('1948–1951\nSerial number: 1590005695\n80mm lenses\n\n3–5: 18/200\n6–7: 12.7/100\n8–9: 8/140\n10: 4.5/50?\n11: 4.5/25-ish\n12: 4.5/50\n10: 4.5/50\n')
    )
  }
};

export const notesReducer: Reducer<NotesState> = (state = initialState, action) => {
  if (updateEditor.test(action)) {
    const note = state[action.payload.noteId];
    return {
      ...state,
      [action.payload.noteId]: {
        ...note,
        editor: action.payload.editorState
      }
    };
  }

  return state;
}