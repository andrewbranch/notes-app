/// <reference path="../../draft-js-plugins-editor.d.ts" />
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { EditorState } from 'draft-js';
import { default as DraftEditor } from 'draft-js-plugins-editor';
import { connect } from 'react-redux';
import { editorSelector } from './Editor.selectors';
import * as editorActions from './Editor.actions';
import { createCoreStylingPlugin } from './core-styling-plugin';

export interface EditorProps {
  editor: EditorState;
  noteId: string;
}

export class Editor extends React.Component<EditorProps & typeof editorActions> {
  private coreStylingPlugin = createCoreStylingPlugin(() => this.props.editor);

  private updateEditorState = (editorState: EditorState) => {
    this.props.updateEditor({ noteId: this.props.noteId, editorState, time: Date.now() });
  }

  render() {
    return (
      <DraftEditor
        editorState={this.props.editor}
        onChange={this.updateEditorState}
        plugins={[this.coreStylingPlugin]}
      />
    );
  }
}

export default connect(editorSelector, dispatch => bindActionCreators(editorActions, dispatch))(Editor);