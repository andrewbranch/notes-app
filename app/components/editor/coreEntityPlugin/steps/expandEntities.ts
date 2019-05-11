import * as assert from 'assert';
import { sumBy } from 'lodash';
import { EditorState } from 'draft-js';
import { getEntitiesNearSelectionEdges, InsertionEdit, performDependentEdits, performUnUndoableEdits, SelectionEdit } from '../../../../utils/draftUtils';
import { isExpandableEntityKey, expandableEntities } from '../entities';
import { EntityData } from '../entities/types';

const verifyEntityRangeContiguous = (ranges: number[]) => {
  for (let i = 2; i < ranges.length; i += 2) {
    assert.equal(ranges[i], ranges[i - 1] + 1);
  }
};

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
      let entityRange: number[] = [];
      block.findEntityRanges(
        character => character.getEntity() === entityKey,
        (start, end) => {
          entityRange.push(start, end);
        }
      );

      if (process.env.NODE_ENV === 'development') {
        verifyEntityRangeContiguous(entityRange);
      }

      const start = entityRange[0];
      const end = entityRange[entityRange.length - 1];
      const expansionEdits = entityDefinition.getExpandEdits(entityData, start, end - start, { blockKey, entity: entityKey, disableUndo: true });
      const relativeAnchorOffset = blockKey === anchorKey && anchorOffset <= end && anchorOffset >= start && anchorOffset - start;
      const relativeFocusOffset = blockKey === focusKey && focusOffset <= end && focusOffset >= start && focusOffset - start;
      const deletionLength = sumBy(expansionEdits, edit => edit.deletionLength || 0);
      const netInsertionLength = sumBy(expansionEdits, edit => edit.text.length) - deletionLength;
      const adjustAnchor = relativeAnchorOffset !== false ? entityDefinition.adjustSelectionOnExpand(relativeAnchorOffset, entityData) - netInsertionLength : 0;
      const adjustFocus = relativeFocusOffset !== false ? entityDefinition.adjustSelectionOnExpand(relativeFocusOffset, entityData) - netInsertionLength : 0;

      edits.push(...expansionEdits);

      if (relativeAnchorOffset !== false) {
        selectionEdit = {
          ...selectionEdit,
          anchorKey: isBackward ? selection.getEndKey() : selection.getEndKey(),
          anchorOffset: isBackward ? selection.getEndOffset() : selection.getStartOffset(),
          adjustAnchorForInsertions: 'leading',
          adjustAnchor
        };
      }

      if (relativeFocusOffset !== false) {
        selectionEdit = {
          ...selectionEdit,
          focusKey: isBackward ? selection.getStartKey() : selection.getStartKey(),
          focusOffset: isBackward ? selection.getStartOffset() : selection.getEndOffset(),
          adjustFocusForInsertions: 'leading',
          adjustFocus
        };
      }
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
        isBackward,
        anchorKey,
        focusKey,
        anchorOffset,
        focusOffset,
        ...selectionEdit
      }
    ]);
  }

  return editorState;
};
