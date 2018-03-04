import { SelectionState, ContentBlock, Entity, ContentState, Modifier, EditorState } from 'draft-js';
import { DecoratorStrategyCallback } from 'draft-js-plugins-editor';

// Can be replaced with ReturnType<T> in TS 2.8
if (false as true) var _ = Entity.mergeData('', {});
export type EntityInstance = typeof _;
if (false as true) var __ = (null as any as EditorState).getLastChangeType();
export type EditorChangeType = typeof __;

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
};

export const createDecoratorStrategyMatchingEntityType = (type: string) => (contentBlock: ContentBlock, callback: DecoratorStrategyCallback, contentState: ContentState): void => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey && contentState.getEntity(entityKey).getType() === type || false;
  }, callback);
};

export const getTextFromSelection = (editorState: EditorState, blockDelimiter = '\n'): string => {
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  const text = [];
  let block = contentState.getBlockForKey(startKey);
  let blockKey = block.getKey();
  do {
    text.push(block.getText().slice(
      blockKey === startKey ? selection.getStartOffset() : 0,
      blockKey === endKey ? selection.getEndOffset() : undefined
    ));
  } while (blockKey !== endKey && (() => {
    block = contentState.getBlockAfter(blockKey);
    return blockKey = block.getKey();
  })());

  return text.join(blockDelimiter);
}

export const getInsertedCharactersFromChange = (changeType: EditorChangeType, oldEditorState: EditorState, newEditorState: EditorState): string => {
  if (changeType === 'insert-characters') {
    const oldSelection = oldEditorState.getSelection();
    const newSelection = newEditorState.getSelection();
    return newEditorState
      .getCurrentContent()
      .getBlockForKey(newSelection.getStartKey())
      .getText()
      .slice(oldSelection.getStartOffset(), newSelection.getEndOffset());
  }

  return '';
};

export const getDeletedCharactersFromChange = (changeType: EditorChangeType, oldEditorState: EditorState, newEditorState: EditorState): string => {
  // backspace-character and delete-character:
  //   single block, collapsed selection
  //   slice block text from old selection start to new selection start
  //
  // remove-range and insert-characters with non-collapsed selection
  //   1+ blocks, non-collapsed selection
  //   deleted characters are the entirety of the old selected text
  //
  const oldSelection = oldEditorState.getSelection();
  if (changeType === 'backspace-character' || changeType === 'delete-character') {
    const block = oldEditorState.getCurrentContent().getBlockForKey(oldSelection.getStartKey());
    return block.getText().slice(...[oldSelection.getStartOffset(), newEditorState.getSelection().getStartOffset()].sort());
  } else if (changeType === 'remove-range' || changeType === 'insert-characters' && !oldSelection.isCollapsed()) {
    return getTextFromSelection(oldEditorState);
  }

  return '';
};
