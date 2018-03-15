import { EditorState, Modifier } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { Set, OrderedSet } from 'immutable';
import { values, isEqual, compact, sum } from 'lodash';
import { stripStylesFromBlock, performUnUndoableEdits, getContiguousStyleRangesNearSelectionEdges, createSelectionWithRange, createSelectionWithSelection } from '../../../utils/draft-utils';
import { decorators } from './decorators';
import { shouldReprocessInlineStyles } from './shouldProcessChanges';
import { styles, isCoreStyle, CoreInlineStyleName } from './styles';
const styleValues = values(styles);

const recreateStylesInBlocks = (editorState: EditorState, affectedBlocks: string[] = [editorState.getSelection().getStartKey()]): EditorState => {
  let contentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();

  affectedBlocks.forEach(blockKey => {
    getContiguousStyleRangesNearSelectionEdges(
      contentState,
      selection,
      isCoreStyle
    ).forEach((ranges, key) => {
      contentState = stripStylesFromBlock(
        contentState,
        blockKey,
        styleName => styleName === key,
        ranges![0][0], // selection must be collapsed in this method
        ranges![0][1]  //
      );
    })

    const newText = contentState.getBlockForKey(blockKey).getText();

    // Go through each styling entity and reapply
    styleValues.forEach(style => {
      let matchArr;
      do {
        matchArr = style.pattern.exec(newText);
        if (matchArr) {
          contentState = style.applyStyle(contentState, blockKey, matchArr.index, matchArr.index + matchArr[0].length);
        }
      } while (matchArr);
    });
  });

  return performUnUndoableEdits(editorState, disabledUndoEditorState => {
    return EditorState.forceSelection(
      EditorState.push(disabledUndoEditorState, contentState, 'change-inline-style'),
      selection
    );
  });
};

export const createCoreStylingPlugin: (getEditorState: () => EditorState) => Plugin = getEditorState => ({
  onChange: editorState => {
    const changeType = editorState.getLastChangeType();
    const oldEditorState = getEditorState();
    const oldContent = oldEditorState.getCurrentContent();
    const oldSelection = oldEditorState.getSelection();
    const newSelection = editorState.getSelection();
    const newFocusKey = newSelection.getFocusKey();
    let newContent = editorState.getCurrentContent();
    
    let newEditorState = editorState;
    if (oldContent !== newContent && shouldReprocessInlineStyles(changeType, oldEditorState, editorState)) {
      switch (changeType) {
        case 'delete-character':
        case 'remove-range':
        case 'backspace-character':
          newEditorState = recreateStylesInBlocks(editorState);
          break;
        case 'split-block':
          newEditorState = recreateStylesInBlocks(editorState, [
            oldSelection.getStartKey(),
            newFocusKey
          ]);
          break;
        case 'insert-characters':
          newEditorState = recreateStylesInBlocks(editorState);
          break;
      }
    }

    newContent = newEditorState.getCurrentContent();
    let blockInFocus = newContent.getBlockForKey(newSelection.getFocusKey()) 
    let textInFocus = blockInFocus.getText();
    const oldStyleRangesInFocus = getContiguousStyleRangesNearSelectionEdges(oldContent, oldSelection, isCoreStyle);
    const newStyleRangesInFocus = getContiguousStyleRangesNearSelectionEdges(newContent, newSelection, isCoreStyle);

    const expansions: number[] = [];
    // Expand
    newStyleRangesInFocus.forEach((ranges, styleKey: CoreInlineStyleName) => {
      const oldRanges = oldStyleRangesInFocus.get(styleKey);
      const focusOffset = newSelection.getFocusOffset();
      const anchorOffset = newSelection.getAnchorOffset();
      ranges!.forEach((range, index) => {
        if (!oldRanges || !oldRanges.find(oldRange => isEqual(oldRange, range))) {
          const text = textInFocus.slice(range[0], range[1]);
          const pattern = styles[styleKey].pattern;
          pattern.lastIndex = 0;
          if (!pattern.test(text)) {
            const newText = styles[styleKey].expand(text);
            newContent = Modifier.replaceText(
              newContent,
              createSelectionWithRange(blockInFocus, range[0], range[1]),
              newText,
              OrderedSet([styleKey])
            );

            newEditorState = EditorState.push(newEditorState, newContent, 'insert-characters');
            expansions[range[0]] = (expansions[range[0]] || 0) + styles[styleKey].decoratorLength;
            expansions[range[1]] = (expansions[range[1]] || 0) + styles[styleKey].decoratorLength;
          }
        }
      });
      
      const shiftAnchor = (sum(expansions.slice(0, anchorOffset + 1)) || 0);
      const shiftFocus = (sum(expansions.slice(0, focusOffset + 1)) || 0);
      newEditorState = EditorState.forceSelection(
        newEditorState,
        createSelectionWithSelection(newSelection, shiftAnchor, shiftFocus)
      );
    });

    newContent = newEditorState.getCurrentContent();
    blockInFocus = newContent.getBlockForKey(newSelection.getFocusKey()) 
    textInFocus = blockInFocus.getText();
    const collapsions: number[] = [];
    // Collapse
    oldStyleRangesInFocus.forEach((ranges, styleKey: CoreInlineStyleName) => {
      const newRanges = newStyleRangesInFocus.get(styleKey);
      const focusOffset = newSelection.getFocusOffset();
      const anchorOffset = newSelection.getAnchorOffset();
      ranges!.forEach((range, index) => {
        if (!newRanges || !newRanges.find(newRange => isEqual(newRange, range))) {
          const lowerBound = range[0] + (sum(expansions.slice(0, range[0] + 1)) || 0);
          const upperBound = range[1] + (sum(expansions.slice(0, range[1] + 1)) || 0);
          const text = textInFocus.slice(lowerBound, upperBound);
          const pattern = styles[styleKey].pattern;
          pattern.lastIndex = 0;
          const match = pattern.exec(text);
          if (match) {
            const newText = styles[styleKey].collapse(match);
            newContent = Modifier.replaceText(
              newContent,
              createSelectionWithRange(blockInFocus, lowerBound, upperBound),
              newText,
              OrderedSet([styleKey])
            );

            newEditorState = EditorState.push(newEditorState, newContent, 'insert-characters');
            collapsions[lowerBound] = (collapsions[lowerBound] || 0) + styles[styleKey].decoratorLength;
            collapsions[upperBound] = (collapsions[upperBound] || 0) + styles[styleKey].decoratorLength;
          }
        }
      });

      const shiftAnchor = -(sum(collapsions.slice(0, anchorOffset + 1)) || 0);
      const shiftFocus = -(sum(collapsions.slice(0, focusOffset + 1)) || 0);
      newEditorState = EditorState.forceSelection(
        newEditorState,
        createSelectionWithSelection(newSelection, shiftAnchor, shiftFocus)
      );
    });

    return newEditorState;
  },

  decorators,

  customStyleMap: styleValues.reduce((map, style) => ({
    ...map,
    [style.name]: style.styleAttributes
  }), {})
});