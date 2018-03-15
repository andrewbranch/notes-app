import { SelectionState, ContentBlock, Entity, ContentState, Modifier, EditorState, CharacterMetadata } from 'draft-js';
import { DecoratorStrategyCallback } from 'draft-js-plugins-editor';
import { constant } from 'lodash';
import { Map } from 'immutable';

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

const getContiguousStyleRangesNearOffset = (block: ContentBlock, offset: number, styleKeyFilter: (styleKey: string) => boolean): Map<string, [number, number][]> => {
  const stylesAtOffset = block.getInlineStyleAt(offset);
  const stylesAdjacentToOffset = block.getInlineStyleAt(offset - 1).subtract(stylesAtOffset);
  const text = styleKeyFilter.length > 1 ? block.getText() : '';
  return stylesAtOffset.union(stylesAdjacentToOffset).reduce((ranges, style) => {
    if (styleKeyFilter(style!)) {
      return ranges!.set(style!, [getContiguousStyleRange(
        block,
        style!,
        stylesAdjacentToOffset.contains(style!) ? offset - 1 : offset
      )]);
    }
    return ranges!;
  }, Map<string, [number, number][]>());
};

export const getContiguousStyleRangesNearSelectionEdges = (content: ContentState, selection: SelectionState, styleKeyFilter: (styleKey: string) => boolean = constant(true)): Map<string, [number, number][]> => {
  const stylesNearFocus = getContiguousStyleRangesNearOffset(content.getBlockForKey(selection.getFocusKey()), selection.getFocusOffset(), styleKeyFilter);
  return selection.isCollapsed()
    ? stylesNearFocus
    : stylesNearFocus.mergeWith((a, b) => a!.concat(b!), getContiguousStyleRangesNearOffset(
      content.getBlockForKey(selection.getAnchorKey()),
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
