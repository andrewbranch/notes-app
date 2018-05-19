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
  private isFocused: boolean = false;

  public focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  private onFocus: React.FocusEventHandler<HTMLElement> = () => this.isFocused = true;
  private onBlur: React.FocusEventHandler<HTMLElement> = () => this.isFocused = false;

  private updateEditorState = (editorState: EditorState) => {
    this.props.updateEditor({ noteId: this.props.noteId, editorState, time: Date.now() });
  }

  // When noteId changes to point at a freshly created EditorState,
  // the SelectionState’s `isFocused` is always false, and causes
  // weird bugs before it gets back into sync. Calling `focus()`
  // makes it set itself to `true`.
  componentDidUpdate(prevProps: EditorProps) {
    if (this.isFocused && this.props.noteId !== prevProps.noteId) {
      this.focus();
    }
  }

  render() {
    return (
      <DraftEditor
        ref={x => this.editor = x}
        editorState={this.props.editor}
        onChange={this.updateEditorState}
        plugins={[this.coreStylingPlugin, this.coreBlockPlugin]}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      />
    );
  }
}

export default connect(editorSelector, dispatch => bindActionCreators(editorActions, dispatch))(Editor);