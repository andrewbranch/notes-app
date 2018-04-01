import * as React from 'react';
import * as assert from 'assert';
import '../../../utils/enzymeConfig';
import { mount, ReactWrapper } from 'enzyme';
import { Editor, EditorProps } from '../../../../app/components/editor/Editor';
import { EditorState } from 'draft-js';
import { noop } from 'lodash';

type EditorProvider = {
  wrapper: ReactWrapper<{}, { editor: EditorState }>;
  wrapperInstance: EditorWrapper;
  editor: ReactWrapper<EditorProps, {}>;
  editorInstance: Editor;
  getEditorState: () => EditorState;
  typeText: (text: string) => void;
};

const createTypeText = (wrapper: ReactWrapper<{}, {}>) => {
  return async (text: string) => {
    const contentEditable = wrapper.find('.public-DraftEditor-content');
    text.split('').forEach(char => contentEditable.simulate('beforeInput', { data: char, preventDefault: noop }));
    await new Promise(resolve => setImmediate(resolve));
  };
}

class EditorWrapper extends React.Component<{}, { editor: EditorState }> {
  state = { editor: EditorState.createEmpty() };
  editorRef: Editor;

  render() {
    return (
      <Editor
        ref={x => this.editorRef = x!}
        noteId="0" editor={this.state.editor}
        updateEditor={(({ editorState }: { editorState: EditorState }) => this.setState({ editor: editorState })) as any}
      />
    );
  }
}

const setup = (): EditorProvider => {
  (global as any).getSelection = () => ({});
  const wrapper = mount<{}, { editor: EditorState }>(<EditorWrapper />);
  const wrapperInstance = wrapper.instance() as EditorWrapper;
  const editor = wrapper.find(Editor);
  const provider: EditorProvider = {
    wrapper,
    wrapperInstance,
    editor,
    editorInstance: wrapperInstance.editorRef,
    typeText: createTypeText(wrapper),
    getEditorState: () => wrapper.state().editor
  };

  provider.editorInstance.focus();
  return provider;
};

describe('coreStylingPlugin', () => {
  describe('steps', () => {
    test('removeInlineStyles', async () => {
      const provider = setup();
      await provider.typeText('hello');
      assert.equal(provider.getEditorState().getCurrentContent().getPlainText(), 'hello');
    });
  });
});
