import { EditorState, Modifier } from 'draft-js';
import { Plugin } from 'draft-js-plugins-editor';
import { Set, OrderedSet } from 'immutable';
import { values } from 'lodash';
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
    const blockInFocus = newContent.getBlockForKey(newSelection.getFocusKey()) 
    const textInFocus = blockInFocus.getText();
    const oldStyleRangesInFocus = getContiguousStyleRangesNearSelectionEdges(oldContent, oldSelection, isCoreStyle);
    const newStyleRangesInFocus = getContiguousStyleRangesNearSelectionEdges(newContent, newSelection, isCoreStyle);

    const oldStyleRangeKeys = Set(oldStyleRangesInFocus.keys());
    const newStyleRangeKeys = Set(newStyleRangesInFocus.keys());

    // Expand
    newStyleRangeKeys.subtract(oldStyleRangeKeys).forEach((styleKey: CoreInlineStyleName) => {
      const focusOffset = newSelection.getFocusOffset();
      const anchorOffset = newSelection.getAnchorOffset();
      const ranges = newStyleRangesInFocus.get(styleKey);
      let shiftFocus = 0;
      let shiftAnchor = 0;
      ranges.forEach((range, index) => {
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
          shiftFocus += styles[styleKey].mapSelectionIndexFromCollapsed(focusOffset - range[0], text);
          shiftAnchor += styles[styleKey].mapSelectionIndexFromCollapsed(anchorOffset - range[0], text);
        }
      });
      
      newEditorState = EditorState.forceSelection(
        newEditorState,
        createSelectionWithSelection(newSelection, shiftAnchor, shiftFocus)
      );
    });

    // Collapse
    oldStyleRangeKeys.subtract(newStyleRangeKeys).forEach((styleKey: CoreInlineStyleName) => {
      const focusOffset = newSelection.getFocusOffset();
      const anchorOffset = newSelection.getAnchorOffset();
      const ranges = oldStyleRangesInFocus.get(styleKey);
      let shiftFocus = 0;
      let shiftAnchor = 0;
      ranges.forEach((range, index) => {
        const text = textInFocus.slice(range[0], range[1]);
        const pattern = styles[styleKey].pattern;
        pattern.lastIndex = 0;
        const match = pattern.exec(text);
        if (match) {
          const newText = styles[styleKey].collapse(match);
          newContent = Modifier.replaceText(
            newContent,
            createSelectionWithRange(blockInFocus, range[0], range[1]),
            newText,
            OrderedSet([styleKey])
          );

          newEditorState = EditorState.push(newEditorState, newContent, 'insert-characters');
          shiftFocus += styles[styleKey].mapSelectionIndexFromExpanded(focusOffset - range[0], text);
          shiftAnchor += styles[styleKey].mapSelectionIndexFromExpanded(anchorOffset - range[0], text);
        }
      });

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