import { EditorState, Modifier } from 'draft-js';
import { entityValues } from '../entities';
import { createSelectionWithRange, performUnUndoableEdits } from '../../../../utils/draftUtils';

export const addEntities = (editorState: EditorState, prevEditorState: EditorState): EditorState => {
  const content = editorState.getCurrentContent();
  const prevContent = prevEditorState.getCurrentContent();
  if (content === prevContent) {
    // Only the seleciton has changed, so there’s nothing to do.
    return editorState;
  }
  
  const selection = editorState.getSelection();
  if (!selection.isCollapsed()) {
    // The only way the selection could not be collapsed in this step is via an undo,
    // in which case I think there’s nothing to do.
    return editorState;
  }

  const changeType = editorState.getLastChangeType();
  const prevSelection = prevEditorState.getSelection();
  const focusKey = selection.getFocusKey();
  const affectedBlocks = changeType === 'split-block' ? [focusKey, prevSelection.getStartKey()] : [focusKey];
  let nextContent = content;

  // Go through each style definition and reapply
  affectedBlocks.forEach(blockKey => {
    const newText = nextContent.getBlockForKey(blockKey).getText();
    entityValues.forEach(entityDefinition => {
      let match: RegExpExecArray | null;
      entityDefinition.pattern.lastIndex = 0;
      while (match = entityDefinition.pattern.exec(newText)) {
        const block = nextContent.getBlockForKey(blockKey);
        // Entities aren’t nestable
        if (block.getEntityAt(match.index)) {
          return;
        }

        nextContent = nextContent.createEntity(
          entityDefinition.type,
          entityDefinition.mutability,
          { ...entityDefinition.getData(match), expanded: true }
        );

        const entityKey = nextContent.getLastCreatedEntityKey();
        const entitySelection = createSelectionWithRange(blockKey, match.index, match.index + match[0].length);
        nextContent = Modifier.applyEntity(nextContent, entitySelection, entityKey);
      }
    });
  });

  if (nextContent !== content) {
    return performUnUndoableEdits(editorState, disabledUndoEditorState => (
      EditorState.forceSelection(
        EditorState.push(disabledUndoEditorState, nextContent, 'apply-entity'),
        editorState.getSelection()
      )
    ));
  }

  return editorState;
};
