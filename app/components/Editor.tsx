import * as React from 'react';
import { bindActionCreators } from 'redux';
import { Editor as DraftEditor, EditorState } from 'draft-js';
import { connect } from 'react-redux';
import { editorSelector } from './Editor.selectors';
import * as editorActions from './Editor.actions';

export interface EditorProps {
  editor: EditorState;
  title: string;
  noteId: string;
}

export class Editor extends React.PureComponent<EditorProps & typeof editorActions> {
  updateEditorState = (editorState: EditorState) => {
    const { noteId } = this.props;
    this.props.updateEditor({ noteId, editorState });
  }
  render() {
    return (
      <DraftEditor
        editorState={this.props.editor}
        onChange={this.updateEditorState}
      />
    );
  }
}

export default connect(editorSelector, dispatch => bindActionCreators(editorActions, dispatch))(Editor);