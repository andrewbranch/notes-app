import { EditorState, Modifier } from 'draft-js';
import { uniq } from 'lodash';
import { expandableEntities, isExpandableEntityKey } from '../entities';
import { createSelectionWithRange, performUnUndoableEdits, getEntitiesNearSelectionEdges, getEntity } from '../../../../utils/draftUtils';
import { EntityData } from '../entities/types';

export const removeEntities = (editorState: EditorState, prevEditorState: EditorState): EditorState => {
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
  let prevSelectedEntities = getEntitiesNearSelectionEdges(prevContent, prevSelection);
  if (changeType === 'split-block') {
    prevSelectedEntities = prevSelectedEntities.mergeWith(
      (a: string[], b: string[]) => uniq([...a, ...b]),
      getEntitiesNearSelectionEdges(content, selection)
    );
  }

  if (!prevSelectedEntities.size) {
    return editorState;
  }

  let nextContent = content;
  prevSelectedEntities.forEach((entityKeys: string[], blockKey: string) => {
    entityKeys.forEach(entityKey => {
      const block = nextContent.getBlockForKey(blockKey);
      if (!block) {
        return;
      }

      const entity = getEntity(nextContent, entityKey);
      if (!entity) {
        return;
      }

      const type = entity.getType();
      if (!isExpandableEntityKey(type)) {
        return;
      }

      const entityData: EntityData = entity.getData();
      if (!entityData.expanded) {
        return;
      }

      const entityDefinition = expandableEntities[type];
      const blockText = block.getText();
      block.findEntityRanges(
        character => character.getEntity() === entityKey,
        (start, end) => {
          const text = blockText.slice(start, end);
          entityDefinition.pattern.lastIndex = 0;
          const match = entityDefinition.pattern.exec(text);
          if (match) {
            nextContent = nextContent.mergeEntityData(entityKey, entityDefinition.getData(match));
          } else {
            nextContent = Modifier.applyEntity(nextContent, createSelectionWithRange(blockKey, start, end), null);
          }
        }
      );
    });
  });

  if (nextContent !== content) {
    return performUnUndoableEdits(editorState, disabledUndoEditorState => {
      return EditorState.forceSelection(
        EditorState.push(disabledUndoEditorState, nextContent, 'apply-entity'),
        editorState.getSelection()
      );
    });
  }

  return editorState;
};
