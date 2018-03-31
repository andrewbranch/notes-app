// import * as React from 'react';
// import * as assert from 'assert';
// import '../../../utils/enzymeConfig';
// import { mount } from 'enzyme';
// import { Editor } from '../../../../app/components/editor/Editor';
// import { EditorState } from 'draft-js';

// class EditorWrapper extends React.Component<{}, { editor: EditorState }> {
//   state = { editor: EditorState.createEmpty() };
//   editorRef: Editor;
//   render() {
//     return (
//       <Editor ref={x => this.editorRef = x!} noteId="0" editor={this.state.editor} updateEditor={(({ editorState }: { editorState: EditorState }) => (console.log('updating'), this.setState({ editor: editorState }))) as any} />
//     )
//   }
// }

// const setup = () => {
//   const wrapper = mount<{}, { editor: EditorState }>(<EditorWrapper />);
//   (wrapper.instance() as EditorWrapper).editorRef.focus();
//   return wrapper;
// };

// describe('coreStylingPlugin', () => {
//   describe('steps', () => {
//     test('removeInlineStyles', () => {
//       // const editor = setup();
//       // editor.find('.public-DraftEditor-content').simulate('input', { target: { innerText: 'a' } });
//       // assert.equal(editor.state().editor.getCurrentContent().getPlainText(), 'a');
//     });
//   });
// });
