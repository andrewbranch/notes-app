/// <reference path="../draft-js-plugins-editor.d.ts" />
import * as React from 'react';
import { bindActionCreators } from 'redux';
import { EditorState, ContentState, Modifier, SelectionState } from 'draft-js';
import { default as DraftEditor, Plugin } from 'draft-js-plugins-editor';
import { connect } from 'react-redux';
import { editorSelector } from './Editor.selectors';
import * as editorActions from './Editor.actions';

const stylingEntities = [{
  name: 'inlineCode',
  rawPattern: /`([^`]+)`/g,
  format: (matchArray: RegExpMatchArray) => matchArray[1],
  createEntity: (currentContent: ContentState) => currentContent.createEntity(
    'core.inlineCode',
    'MUTABLE'
  )
}]

const plugin: Plugin = {
  handleBeforeInput: (character, editorState, pluginProvider) => {
    const selectionState = editorState.getSelection()
    const cursorPositionKey = selectionState.getStartKey();
    const text = editorState.getCurrentContent().getBlockForKey(cursorPositionKey).getText();
    const newText = text + character;
    let contentState = editorState.getCurrentContent();
    stylingEntities.forEach(style => {
      let matchArr;
      do {
        matchArr = style.rawPattern.exec(newText);
        if (matchArr) {
          contentState = style.createEntity(contentState);
          const entityKey = contentState.getLastCreatedEntityKey();
          const entitySelection = selectionState.merge({
            anchorOffset: matchArr.index,
            focusOffset: matchArr.index + matchArr[0].length - 1
          }) as SelectionState;
          contentState = Modifier.applyEntity(contentState, entitySelection, entityKey);
        }
      } while (matchArr);
    });

    const newEditorState = EditorState.push(editorState, contentState, 'apply-entity');
    if (newEditorState !== editorState) {
      pluginProvider.setEditorState(newEditorState);
      return 'handled';
    }

    return 'not-handled';
  }
}

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
        plugins={[plugin]}
      />
    );
  }
}

export default connect(editorSelector, dispatch => bindActionCreators(editorActions, dispatch))(Editor);