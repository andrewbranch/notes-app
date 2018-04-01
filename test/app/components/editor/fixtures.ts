import { EditorState, convertFromRaw, SelectionState } from 'draft-js';

export const boldWithSelectionAtEnd = EditorState.forceSelection(EditorState.createWithContent(convertFromRaw({"blocks":[{"key":"aacj3","text":"**Bold**","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":8,"style":"BOLD"},{"offset":0,"length":2,"style":"core.styling.decorator"},{"offset":6,"length":2,"style":"core.styling.decorator"}],"entityRanges":[],"data":{}}],"entityMap":{}} as any)), new SelectionState({"anchorKey":"aacj3","anchorOffset":8,"focusKey":"aacj3","focusOffset":8,"isBackward":false,"hasFocus":true}));
export const boldWithSelectionAtStart = EditorState.forceSelection(EditorState.createWithContent(convertFromRaw({"blocks":[{"key":"aacj3","text":"**Bold**","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":8,"style":"BOLD"},{"offset":0,"length":2,"style":"core.styling.decorator"},{"offset":6,"length":2,"style":"core.styling.decorator"}],"entityRanges":[],"data":{}}],"entityMap":{}} as any)), new SelectionState({"anchorKey":"aacj3","anchorOffset":0,"focusKey":"aacj3","focusOffset":0,"isBackward":false,"hasFocus":true}));