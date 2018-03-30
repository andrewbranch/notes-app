import * as React from 'react';
import '../../../utils/enzymeConfig';
import { mount } from 'enzyme';
import { Editor } from '../../../../app/components/editor/Editor';
import { EditorState } from 'draft-js';

class EditorWrapper extends React.Component<{}, { editor: EditorState }> {
  state = { editor: EditorState.createEmpty() };
  render() {
    return (
      <Editor noteId="0" editor={this.state.editor} updateEditor={(({ editorState }: { editorState: EditorState }) => this.setState({ editor: editorState })) as any} />
    )
  }
}

const setup = () => {
  return mount(<EditorWrapper />);
};

describe('coreStylingPlugin', () => {
  describe('steps', () => {
    test('remoeInlineStyles', () => {
      const wrapper = setup();
      wrapper.simulate('click');
      
    });
  });
});
