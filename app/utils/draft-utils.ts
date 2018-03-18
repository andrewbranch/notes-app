import { SelectionState, ContentBlock, Entity, ContentState, Modifier, EditorState, CharacterMetadata } from 'draft-js';
import { DecoratorStrategyCallback } from 'draft-js-plugins-editor';
import { constant, sum, isEqual } from 'lodash';
import { Map, OrderedSet } from 'immutable';

// Can be replaced with ReturnType<T> in TS 2.8
if (false as true) var _ = Entity.mergeData('', {});
export type EntityInstance = typeof _;
if (false as true) var __ = (null as any as EditorState).getLastChangeType();
export type EditorChangeType = typeof __;

export const createSelectionWithRange = (blockOrKey: ContentBlock | string, start: number, end: number): SelectionState => {
  const blockKey = typeof blockOrKey === 'string' ? blockOrKey : blockOrKey.getKey();
  return SelectionState.createEmpty(blockKey).merge({ anchorOffset: start, focusOffset: end }) as SelectionState
};

export const createSelectionWithSelection = (selectionState: SelectionState, moveAnchor: number, moveFocus: number): SelectionState => {
  return selectionState.merge({
    anchorOffset: selectionState.getAnchorOffset() + moveAnchor,
    focusOffset: selectionState.getFocusOffset() + moveFocus
  }) as SelectionState;
};

export const createSelectionWithBlock = (block: ContentBlock): SelectionState => (
  SelectionState.createEmpty(block.getKey()).merge({ focusOffset: block.getLength() }) as SelectionState
);

// https://github.com/facebook/draft-js/issues/1700
export const hasEdgeWithin = (selectionState: SelectionState, blockKey: string, start: number, end: number): boolean => {
  if (selectionState.getFocusKey() !== selectionState.getAnchorKey()) {
    return selectionState.hasEdgeWithin(blockKey, start, end);
  }

  if (selectionState.getFocusKey() !== blockKey) {
    return false;
  }

  const focusOffset = selectionState.getFocusOffset();
  const anchorOffset = selectionState.getAnchorOffset();
  return focusOffset >= start && focusOffset <= end || anchorOffset >= start && anchorOffset <= end;
};

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

export const stripStylesFromBlock = (contentState: ContentState, blockOrKey: ContentBlock | string, styleFilter: (styleName: string) => boolean, start: number = 0, end?: number): ContentState => {
  const block = typeof blockOrKey === 'string' ? contentState.getBlockForKey(blockOrKey): blockOrKey;
  const originalCharacters = block.getCharacterList()
  const newCharacters = originalCharacters.slice(start, end).map(character => {
    return character!.getStyle().reduce((char, style) => {
      return styleFilter(style!) ? CharacterMetadata.removeStyle(char!, style!) : char!;
    }, character!);
  });

  const newBlock = block.set('characterList', originalCharacters.slice(0, start).concat(newCharacters).concat(originalCharacters.slice(end || originalCharacters.size + 1))) as ContentBlock;
  return contentState.setIn(['blockMap', block.getKey()], newBlock) as ContentState;
};

export const createDecoratorStrategyMatchingEntityType = (type: string) => (contentBlock: ContentBlock, callback: DecoratorStrategyCallback, contentState: ContentState): void => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey && contentState.getEntity(entityKey).getType() === type || false;
  }, callback);
};

export const forEachBlockInSelection = (editorState: EditorState, callback: (block: ContentBlock, start: number, end: number) => void): void => {
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  let block = contentState.getBlockForKey(startKey);
  let blockKey = block.getKey();
  do {
    callback(
      block,
      blockKey === startKey ? selection.getStartOffset() : 0,
      blockKey === endKey ? selection.getEndOffset() : block.getLength()
    );
  } while (blockKey !== endKey && (() => {
    block = contentState.getBlockAfter(blockKey);
    return blockKey = block.getKey();
  })());
}

export const mapBlocksInSelection = <T>(editorState: EditorState, callback: (block: ContentBlock, start: number, end: number) => T): T[] => {
  const arr: T[] = [];
  forEachBlockInSelection(editorState, (block, start, end) => arr.push(callback(block, start, end)));
  return arr;
}

export const getTextFromSelection = (editorState: EditorState, blockDelimiter = '\n'): string => {
  return mapBlocksInSelection(editorState, (block, start, end) => {
    return block.getText().slice(start, end);
  }).join(blockDelimiter);
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

export const getAdjacentCharacters = (contentState: ContentState, selectionState: SelectionState): [string, string] => {
  const focusOffset = selectionState.getFocusOffset();
  const text = contentState.getBlockForKey(selectionState.getFocusKey()).getText();
  return [
    text.slice(focusOffset - 1, focusOffset),
    text.slice(focusOffset, focusOffset + 1)
  ];
};

export const performUnUndoableEdits = (editorState: EditorState, performEdits: (disabledUndoEditorState: EditorState) => EditorState): EditorState => {
  const disabledUndoEditorState = EditorState.set(editorState, { allowUndo: false });
  return EditorState.set(performEdits(disabledUndoEditorState), { allowUndo: true });
};

export const getContiguousStyleRange = (block: ContentBlock, styleKey: string, aroundIndex: number): [number, number] => {
  const characters = block.getCharacterList();
  let start = aroundIndex;
  let end = aroundIndex;
  while (start >= 0 && characters.get(start).hasStyle(styleKey)) start--;
  while (end < characters.size && characters.get(end).hasStyle(styleKey)) end++;
  return [start + 1, end];
};

export const getContiguousStyleRangesNearOffset = (block: ContentBlock, offset: number, styleKeyFilter: (styleKey: string) => boolean): Map<string, [string, number, number][]> => {
  const stylesAtOffset = block.getInlineStyleAt(offset);
  const stylesAdjacentToOffset = offset > 0 ? block.getInlineStyleAt(offset - 1).subtract(stylesAtOffset) : OrderedSet<string>();
  const text = styleKeyFilter.length > 1 ? block.getText() : '';
  return stylesAtOffset.union(stylesAdjacentToOffset).reduce((ranges, style) => {
    if (styleKeyFilter(style!)) {
      return ranges!.set(style!, [[block.getKey(), ...getContiguousStyleRange(
        block,
        style!,
        stylesAdjacentToOffset.contains(style!) ? offset - 1 : offset
      )] as [string, number, number]]);
    }
    return ranges!;
  }, Map<string, [string, number, number][]>());
};

export const getContiguousStyleRangesNearSelectionEdges = (content: ContentState, selection: SelectionState, styleKeyFilter: (styleKey: string) => boolean = constant(true)): Map<string, [string, number, number][]> => {
  // We intentionally allow separated `content` and `selection`, so if, say,
  // you are looking at updated content at a previous selection, the blocks could be undefined.
  const focusBlock: ContentBlock | undefined = content.getBlockForKey(selection.getFocusKey());
  const anchorBlock: ContentBlock | undefined = content.getBlockForKey(selection.getAnchorKey());
  const stylesNearFocus = focusBlock
    ? getContiguousStyleRangesNearOffset(focusBlock, selection.getFocusOffset(), styleKeyFilter)
    : Map<string, [string, number, number][]>();
  return selection.isCollapsed() || !anchorBlock
    ? stylesNearFocus
    : stylesNearFocus.mergeWith((a, b) => isEqual(a, b) ? a! : a!.concat(b!), getContiguousStyleRangesNearOffset(
      anchorBlock,
      selection.getAnchorOffset(),
      styleKeyFilter
    ));
};

const rangesOverlapUnidirectionally = (a: [number, number], b: [number, number]) => {
  // a:  --------     a: -------
  // b:     --------  b:   ---
  return b[0] >= a[0] && b[0] < a[1];
};

export const rangesOverlap = (a: [number, number], b: [number, number]): boolean => {
  return rangesOverlapUnidirectionally(a, b) || rangesOverlapUnidirectionally(b, a);
};

export type InsertionEdit = {
  type: 'insertion';
  text: string;
  blockKey: string;
  offset: number;
  deletionLength?: number;
  style?: OrderedSet<string>;
  disableUndo?: true;
}

export type SelectionEdit = {
  type: 'selection';
  anchorKey: string;
  anchorOffset: number;
  focusKey: string;
  focusOffset: number;
  isBackward: boolean;
  adjustFocusForInsertions?: 'leading' | 'trailing';
  adjustAnchorForInsertions?: 'leading' | 'trailing';
}

export type Edit = InsertionEdit | SelectionEdit;

export const performDependentEdits = (editorState: EditorState, edits: Edit[]) => {
  const insertions: { [blockKey: string]: number[] } = {};
  const deletions: { [blockKey: string]: number[] } = {};
  return edits.reduce((nextEditorState, edit) => {
    const content = nextEditorState.getCurrentContent();
    switch (edit.type) {
      case 'insertion':
        insertions[edit.blockKey] = insertions[edit.blockKey] || [0];
        deletions[edit.blockKey] = deletions[edit.blockKey] || [0];
        const insertOffset = edit.offset + sum(insertions[edit.blockKey].slice(0, edit.offset + 1)) - sum(deletions[edit.blockKey].slice(0, edit.offset + 1));
        insertions[edit.blockKey][edit.offset] = (insertions[edit.blockKey][edit.offset] || 0) + edit.text.length;
        deletions[edit.blockKey][edit.offset] = (deletions[edit.blockKey][edit.offset] || 0) + (edit.deletionLength || 0);
        const nextContent = Modifier.replaceText(content, createSelectionWithRange(edit.blockKey, insertOffset, insertOffset + (edit.deletionLength || 0)), edit.text, edit.style);
        const changeType = edit.text.length ? 'insert-characters' : 'remove-range';
        return edit.disableUndo ? performUnUndoableEdits(
          nextEditorState,
          disabledUndo => EditorState.push(disabledUndo, nextContent, changeType)
        ) : EditorState.push(nextEditorState, nextContent, changeType);
      case 'selection':
        insertions[edit.anchorKey] = insertions[edit.anchorKey] || [0];
        deletions[edit.anchorKey] = deletions[edit.anchorKey] || [0];
        insertions[edit.focusKey] = insertions[edit.focusKey] || [0];
        deletions[edit.focusKey] = deletions[edit.focusKey] || [0];
        const adjustFocusForInsertions = edit.adjustFocusForInsertions === 'leading' ? 0 : 1;
        const adjustAnchorForInsertions = edit.adjustAnchorForInsertions === 'leading' ? 0 : 1;
        const anchorDelta = sum(insertions[edit.anchorKey].slice(0, edit.anchorOffset + adjustAnchorForInsertions)) - sum(deletions[edit.anchorKey].slice(0, edit.anchorOffset + adjustAnchorForInsertions));
        const focusDelta = sum(insertions[edit.focusKey].slice(0, edit.focusOffset + adjustFocusForInsertions)) - sum(deletions[edit.focusKey].slice(0, edit.focusOffset + adjustFocusForInsertions));
        return EditorState.forceSelection(
          nextEditorState,
          SelectionState.createEmpty(edit.anchorKey).merge({
            anchorKey: edit.anchorKey,
            anchorOffset: edit.anchorOffset + anchorDelta,
            focusKey: edit.focusKey,
            focusOffset: edit.focusOffset + focusDelta,
            isBackward: edit.isBackward
          }) as SelectionState
        );
    }
  }, editorState);
};
