import * as React from 'react';
import '../../../utils/enzymeConfig';
import { mount, ReactWrapper } from 'enzyme';
import { Editor, EditorProps } from '../../../../app/components/editor/Editor';
import { EditorState, SelectionState } from 'draft-js';
import { noop } from 'lodash';

const flush = () => new Promise(resolve => setImmediate(resolve));

export enum Key {
  BACKSPACE =  8,
  TAB =        9,
  RETURN =    13,
  ALT =       18,
  ESC =       27,
  SPACE =     32,
  PAGE_UP =   33,
  PAGE_DOWN = 34,
  END =       35,
  HOME =      36,
  LEFT =      37,
  UP =        38,
  RIGHT =     39,
  DOWN =      40,
  DELETE =    46,
  COMMA =    188,
  PERIOD =   190,
  A =         65,
  Z =         90,
  ZERO =      48,
  NUMPAD_0 =  96,
  NUMPAD_9 = 105
};

type RawSelectionState = {
  anchorKey: string;
  focusKey: string;
  anchorOffset: number;
  focusOffset: number;
  isBackwards: boolean;
  hasFocus: boolean;
}

export type EditorProvider = {
  wrapper: ReactWrapper<{}, { editor: EditorState }>;
  wrapperInstance: EditorWrapper;
  editor: ReactWrapper<EditorProps, {}>;
  editorInstance: Editor;
  getEditorState: () => EditorState;
  typeText: (text: string) => Promise<void>;
  pressKey: (key: Key, times?: number) => Promise<void>;
  setSelection: (selection: Partial<RawSelectionState>) => Promise<void>;
};

const createTypeText = (contentEditable: ReactWrapper<{}, {}>) => {
  return async (text: string) => {
    const chars = text.split('');
    for (let char of chars) {
      contentEditable.simulate('beforeInput', { data: char, preventDefault: noop });
      await flush();
    }
  };
}

export class EditorWrapper extends React.Component<{}, { editor: EditorState }> {
  state = { editor: EditorState.createEmpty() };
  editorRef: Editor;

  private updateEditor = ({ editorState }: { editorState: EditorState }) => {
    this.setState({ editor: editorState });
  }

  render() {
    return (
      <Editor
        ref={x => this.editorRef = x!}
        noteId="0"
        editor={this.state.editor}
        updateEditor={this.updateEditor as any}
      />
    );
  }
}

type EditorProviderOptions = Readonly<{
  initialEditorState?: EditorState;
}>

export const createEditorProvider = async (options: EditorProviderOptions = {}): Promise<EditorProvider> => {
  (global as any).getSelection = () => ({});
  (window as any).scrollTo = noop;
  const wrapper = mount<{}, { editor: EditorState }>(<EditorWrapper />);
  const wrapperInstance = wrapper.instance() as EditorWrapper;
  const contentEditable = wrapper.find('.public-DraftEditor-content');
  const editor = wrapper.find(Editor);
  const provider: EditorProvider = {
    wrapper,
    wrapperInstance,
    editor,
    editorInstance: wrapperInstance.editorRef,
    typeText: createTypeText(contentEditable),
    getEditorState: () => wrapper.state().editor,
    pressKey: async (key, times = 1) => {
      for (let i = 0; i < times; i++) {
        contentEditable.simulate('keyDown', { which: key, keyCode: key });
        await flush();
      }
    },
    setSelection: async selection => new Promise<void>(resolve => {
      wrapper.setState({
        editor: EditorState.forceSelection(
          wrapper.state().editor,
          wrapper.state().editor.getSelection().merge(selection) as SelectionState
        )
      }, resolve);
    })
  };

  provider.editorInstance.focus();

  if (options.initialEditorState) {
    return new Promise<EditorProvider>(resolve => {
      provider.wrapper.setState({
        editor: options.initialEditorState!
      }, () => resolve(provider));
    });
  }

  return provider;
};