/// <reference path="../../draft-js-plugins-editor.d.ts" />
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { EditorState } from 'draft-js';
import { default as DraftEditor } from 'draft-js-plugins-editor';
import { connect } from 'react-redux';
import { editorSelector } from './Editor.selectors';
import * as editorActions from './Editor.actions';
import { createCoreStylingPlugin } from './coreStylingPlugin';
import { createCoreBlockPlugin } from './coreBlockPlugin';

export interface EditorProps {
  editor: EditorState;
  noteId: string;
}

export class Editor extends React.Component<EditorProps & typeof editorActions> {
  private coreStylingPlugin = createCoreStylingPlugin(() => this.props.editor);
  private coreBlockPlugin = createCoreBlockPlugin(() => this.props.editor);
  private editor: DraftEditor | null;

  public focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  private updateEditorState = (editorState: EditorState) => {
    this.props.updateEditor({ noteId: this.props.noteId, editorState, time: Date.now() });
  }

  render() {
    return (
      <DraftEditor
        ref={x => this.editor = x}
        editorState={this.props.editor}
        onChange={this.updateEditorState}
        plugins={[this.coreStylingPlugin, this.coreBlockPlugin]}
      />
    );
  }
}

export default connect(editorSelector, dispatch => bindActionCreators(editorActions, dispatch))(Editor);