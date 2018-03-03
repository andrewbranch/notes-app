import { SelectionState, ContentBlock, Entity, ContentState, Modifier } from 'draft-js';
import { DecoratorStrategyCallback } from 'draft-js-plugins-editor';

// Can be replaced with ReturnType<T> in TS 2.8
try { if (false as true) var _ = Entity.mergeData('', {}); } catch {}
type EntityInstance = typeof _;

export const createSelectionWithRange = (blockOrKey: ContentBlock | string, start: number, end: number): SelectionState => {
  const blockKey = typeof blockOrKey === 'string' ? blockOrKey : blockOrKey.getKey();
  return SelectionState.createEmpty(blockKey).merge({ anchorOffset: start, focusOffset: end }) as SelectionState
};

export const createSelectionWithSelection = (selectionState: SelectionState, moveStart: number, moveEnd: number): SelectionState => {
  return selectionState.merge({
    anchorOffset: selectionState.getAnchorOffset() + moveStart,
    focusOffset: selectionState.getFocusOffset() + moveEnd
  }) as SelectionState;
};

export const createSelectionWithBlock = (block: ContentBlock): SelectionState => (
  SelectionState.createEmpty(block.getKey()).merge({ focusOffset: block.getLength() }) as SelectionState
);

export const stripEntitiesFromBlock = (contentState: ContentState, blockOrKey: ContentBlock | string, entityFilter: (entity: EntityInstance) => boolean): ContentState => {
  const block = typeof blockOrKey === 'string' ? contentState.getBlockForKey(blockOrKey): blockOrKey;
  let newContentState = contentState;
  block.findEntityRanges(value => {
    const entityKey = value.getEntity();
    const entity = entityKey && contentState.getEntity(entityKey);
    return entity && entityFilter(entity) || false;
  }, (start, end) => {
    const entitySelection = createSelectionWithRange(block, start, end);
    newContentState = Modifier.applyEntity(newContentState, entitySelection, null);
  });

  return newContentState;
}

export const createDecoratorStrategyMatchingEntityType = (type: string) => (contentBlock: ContentBlock, callback: DecoratorStrategyCallback, contentState: ContentState): void => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey && contentState.getEntity(entityKey).getType() === type || false;
  }, callback);
}