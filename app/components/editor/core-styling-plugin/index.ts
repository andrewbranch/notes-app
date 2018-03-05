import { EditorState } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { mapBlocksInSelection, stripStylesFromBlock } from '../../../utils/draft-utils';
import { decorators } from './decorators';
import { shouldReprocessInlineStyles } from './shouldProcessChanges';
import { styles } from './styles';

const recreateStylesInBlocks = (editorState: EditorState, affectedBlocks: string[] = [editorState.getSelection().getStartKey()]): EditorState => {
  let contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();

  // Because a single character change could change several entites in a block,
  // easiest thing to do is to delete them all and recreate them all.
  // This probably isn’t the most efficient thing, so we might need to
  // revisit this logic later if performance suffers.
  affectedBlocks.forEach(blockKey => {
    contentState = stripStylesFromBlock(
      contentState,
      blockKey,
      styleName => styleName.startsWith('core.styling')
    );

    const newText = contentState.getBlockForKey(blockKey).getText();

    // Go through each styling entity and reapply
    styles.forEach(style => {
      let matchArr;
      do {
        matchArr = style.pattern.exec(newText);
        if (matchArr) {
          contentState = style.applyStyle(contentState, blockKey, matchArr.index, matchArr.index + matchArr[0].length);
        }
      } while (matchArr);
    });
  });

  return EditorState.forceSelection(
    EditorState.push(editorState, contentState, 'change-inline-style'),
    selection
  );
};

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  onChange: editorState => {
    const changeType = editorState.getLastChangeType();
    const oldEditorState = getEditorState();
    const oldContent = oldEditorState.getCurrentContent();
    const newContent = editorState.getCurrentContent();
    if (oldContent !== newContent && shouldReprocessInlineStyles(changeType, oldEditorState, editorState)) {
      switch (changeType) {
        case 'delete-character':
        case 'remove-range':
        case 'backspace-character': return recreateStylesInBlocks(editorState);
        case 'split-block': return recreateStylesInBlocks(editorState, [
          oldEditorState.getSelection().getStartKey(),
          editorState.getSelection().getStartKey()
        ]);
        case 'insert-characters':
          return recreateStylesInBlocks(editorState);
      }
    } else {
      // Selection changed only
      const selection = editorState.getSelection();
      mapBlocksInSelection(editorState, (block, start, end) => {
        block.findEntityRanges(value => {
          const entityKey = value.getEntity();
          return entityKey && newContent.getEntity(entityKey).getType().startsWith('core.styling') || false;
        }, (start, end) => {
          if (selection.hasEdgeWithin(block.getKey(), start, end)) {
            // const entity = block.getEntityAt(start);
          }
        });
      });
    }

    return editorState;
  },

  decorators,

  customStyleMap: styles.reduce((map, style) => ({
    ...map,
    [style.name]: style.styleAttributes
  }), {})
});