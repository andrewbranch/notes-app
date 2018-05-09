import * as React from 'react';
import { render } from 'react-dom';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from '../../../app/components/editor/Editor';

class EditorWrapper extends React.Component<{}, { editor: EditorState }> {
  state = { editor: EditorState.createEmpty() };
  editorRef: Editor;

  private updateEditor = ({ editorState }: { editorState: EditorState }) => {
    this.setState({ editor: editorState });
  }

  componentDidMount() {
    this.editorRef.focus();
    (window as any).getContentState = () => convertToRaw(this.state.editor.getCurrentContent());
    (window as any).getSelectionState = () => this.state.editor.getSelection().toJS();
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

render(
  <>
    <EditorWrapper />
    <a href="#" id="outside-editor">Something outside the editor</a>
  </>
  , document.getElementById('app')
);
