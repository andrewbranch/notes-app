/// <reference path="../../draft-js-plugins-editor.d.ts" />
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { EditorState } from 'draft-js';
import { default as DraftEditor } from 'draft-js-plugins-editor';
import { connect } from 'react-redux';
import { editorSelector } from './Editor.selectors';
import * as editorActions from './Editor.actions';
import { createCoreStylingPlugin } from './core-styling-plugin';
const coreStylingPlugin = createCoreStylingPlugin();

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
        plugins={[coreStylingPlugin]}
      />
    );
  }
}

export default connect(editorSelector, dispatch => bindActionCreators(editorActions, dispatch))(Editor);