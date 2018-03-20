import { ContentState, RawDraftContentState, ContentBlock, RawDraftContentBlock } from "draft-js";

const defaultNoteTitle = 'Untitled note';

const getBlockText = (block: ContentBlock | RawDraftContentBlock) => (block instanceof ContentBlock ? block.getText() : block.text).trim();
const blockHasContents = (block: ContentBlock | RawDraftContentBlock) => !!getBlockText(block);

export const getNoteTitle = (content: ContentState | RawDraftContentState): string => {
  const blocks: (ContentBlock | RawDraftContentBlock)[] = content instanceof ContentState ? content.getBlocksAsArray() : content.blocks;
  const firstNonEmptyBlock = blocks.find(blockHasContents);
  return firstNonEmptyBlock ? getBlockText(firstNonEmptyBlock) : defaultNoteTitle;
};
