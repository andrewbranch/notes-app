import * as assert from 'assert';
import { EditorState } from 'draft-js';
import { getEntitiesNearSelectionEdges, InsertionEdit, performDependentEdits, performUnUndoableEdits, Edit, SelectionEdit } from '../../../../utils/draftUtils';
import { isExpandableEntityKey, expandableEntities } from '../entities';
import { EntityData } from '../entities/types';

export const expandEntities = (editorState: EditorState): EditorState => {
  const content = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const anchorKey = selection.getAnchorKey();
  const focusKey = selection.getFocusKey();
  const anchorOffset = selection.getAnchorOffset();
  const focusOffset = selection.getFocusOffset();
  const isBackward = selection.getIsBackward();
  const edits: InsertionEdit[] = [];
  let selectionEdit: Partial<SelectionEdit> = {};
  let nextContent = content;
  getEntitiesNearSelectionEdges(content, selection).forEach((entityKeys: string[], blockKey: string) => {
    const block = content.getBlockForKey(blockKey);
    entityKeys.forEach(entityKey => {
      const entity = content.getEntity(entityKey);
      const entityType = entity.getType();
      if (!isExpandableEntityKey(entityType)) {
        return;
      }

      const entityData: EntityData = entity.getData();
      if (entityData.expanded) {
        return;
      }

      const entityDefinition = expandableEntities[entityType];
      const dataUpdate = entityDefinition.updateDataOnExpand ? entityDefinition.updateDataOnExpand(entityData) : null;
      const newData: EntityData = { ...dataUpdate, expanded: true };
      nextContent = content.mergeEntityData(entityKey, newData);
      let runCount = 0;
      block.findEntityRanges(
        character => character.getEntity() === entityKey,
        (start, end) => {
          runCount++;
          const expandedText = entityDefinition.getExpandedText(entityData);
          const relativeAnchorOffset = blockKey === anchorKey && anchorOffset <= end && anchorOffset >= start && anchorOffset - start;
          const relativeFocusOffset = blockKey === focusKey && focusOffset <= end && focusOffset >= start && focusOffset - start;
          const deletionLength = end - start;
          const netInsertionLength = expandedText.length - deletionLength;
          const adjustAnchor = relativeAnchorOffset !== false ? entityDefinition.adjustSelectionOnExpand(relativeAnchorOffset, entityData) - netInsertionLength : 0;
          const adjustFocus = relativeFocusOffset !== false ? entityDefinition.adjustSelectionOnExpand(relativeFocusOffset, entityData) - netInsertionLength : 0;

          edits.push({
            type: 'insertion',
            blockKey,
            offset: start,
            deletionLength: end - start,
            text: expandedText,
            disableUndo: true,
            entity: entityKey
          });

          if (relativeAnchorOffset !== false) {
            selectionEdit = {
              ...selectionEdit,
              type: 'selection',
              isBackward,
              anchorKey: isBackward ? selection.getEndKey() : selection.getEndKey(),
              anchorOffset: isBackward ? selection.getEndOffset() : selection.getStartOffset(),
              adjustAnchorForInsertions: 'leading',
              adjustAnchor
            };
          }

          if (relativeFocusOffset !== false) {
            selectionEdit = {
              ...selectionEdit,
              type: 'selection',
              isBackward,
              focusKey: isBackward ? selection.getStartKey() : selection.getStartKey(),
              focusOffset: isBackward ? selection.getStartOffset() : selection.getEndOffset(),
              adjustFocusForInsertions: 'leading',
              adjustFocus
            };
          }
        }
      );

      assert.equal(runCount, 1);
    });
  });

  if (edits.length) {
    // This ternary is always true until Draft upgrades the Entity implementation; always false afterwards
    const editorStateWithNewEntities = nextContent === content ? editorState : performUnUndoableEdits(editorState, disabledUndoEditorState => (
      EditorState.push(disabledUndoEditorState, nextContent, 'apply-entity')
    ));

    return performDependentEdits(editorStateWithNewEntities, [...edits, selectionEdit as SelectionEdit]);
  }

  return editorState;
};
