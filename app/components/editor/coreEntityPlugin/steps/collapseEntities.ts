import { EditorState } from 'draft-js';
import { getEntitiesNearSelectionEdges, hasEdgeWithin, getEntity, InsertionEdit, performDependentEdits, performUnUndoableEdits } from '../../../../utils/draftUtils';
import { isExpandableEntityKey, expandableEntities } from '../entities';
import { EntityData } from '../entities/types';

export const collapseEntities = (editorState: EditorState, prevEditorState: EditorState): EditorState => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const prevSelection = prevEditorState.getSelection();
  const edits: InsertionEdit[] = [];
  let nextContent = content;
  getEntitiesNearSelectionEdges(content, prevSelection).forEach((entityKeys: string[], blockKey: string) => {
    const block = content.getBlockForKey(blockKey);
    entityKeys.forEach(entityKey => {
      const entity = getEntity(content, entityKey);
      if (!entity) {
        return;
      }

      const entityType = entity.getType();
      if (!isExpandableEntityKey(entityType)) {
        return;
      }

      const entityData: EntityData = entity.getData();
      if (!entityData.expanded) {
        return;
      }
      
      const entityDefinition = expandableEntities[entityType];
      block.findEntityRanges(
        character => character.getEntity() === entityKey,
        (start, end) => {
          // TODO: I don’t think I need to check hasEdgeWithin
          if (!hasEdgeWithin(selection, blockKey, start, end)) {
            const dataUpdate = entityDefinition.updateDataOnCollapse ? entityDefinition.updateDataOnCollapse(entityData) : null;
            const newData: EntityData = { ...dataUpdate, expanded: false };
            nextContent = content.mergeEntityData(entityKey, newData);

            edits.push({
              type: 'insertion',
              blockKey,
              offset: start,
              deletionLength: end - start,
              text: entityDefinition.getCollapsedText(entityData),
              disableUndo: true,
              entity: entityKey
            });
          }
        }
      );
    });
  });

  if (edits.length) {
    // This ternary is always true until Draft upgrades the Entity implementation; always false afterwards
    const editorStateWithNewEntities = nextContent === content ? editorState : performUnUndoableEdits(editorState, disabledUndoEditorState => (
      EditorState.push(disabledUndoEditorState, nextContent, 'apply-entity')
    ));

    return performDependentEdits(editorStateWithNewEntities, [
      ...edits,
      {
        type: 'selection',
        focusKey: selection.getFocusKey(),
        focusOffset: selection.getFocusOffset(),
        anchorKey: selection.getAnchorKey(),
        anchorOffset: selection.getAnchorOffset(),
        isBackward: selection.getIsBackward()
      }
    ]);
  }

  return editorState;
};
