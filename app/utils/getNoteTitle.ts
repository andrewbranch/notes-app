import { ContentState, RawDraftContentState, ContentBlock, RawDraftContentBlock, EditorState } from 'draft-js';
import { collapseInlineStylesInBlock } from '../components/editor/coreStylingPlugin/steps/collapseInlineStyles';
import { performDependentEdits } from './draftUtils';
import { collapseBlocks } from '../components/editor/coreBlockPlugin/steps/collapseBlocks';

const defaultNoteTitle = 'Untitled note';

const getBlockText = (block: ContentBlock | RawDraftContentBlock) => (block instanceof ContentBlock ? block.getText() : block.text).trim();
const blockHasContents = (block: ContentBlock | RawDraftContentBlock) => !!getBlockText(block);

export const getNoteTitle = (content: ContentState | RawDraftContentState): string => {
  const blocks: (ContentBlock | RawDraftContentBlock)[] = content instanceof ContentState ? content.getBlocksAsArray() : content.blocks;
  const firstNonEmptyBlock = blocks.find(blockHasContents);
  if (firstNonEmptyBlock instanceof ContentBlock) {
    // This is lame, we need to create a dummy editor state or change `performDependentEdits`
    const dummyEditorState = EditorState.createWithContent(ContentState.createFromBlockArray([firstNonEmptyBlock]));
    return collapseBlocks(
      performDependentEdits(dummyEditorState, collapseInlineStylesInBlock(firstNonEmptyBlock)),
      [firstNonEmptyBlock.getKey()],
      true
    ).getCurrentContent().getFirstBlock().getText().trim() || defaultNoteTitle;
  }

  return firstNonEmptyBlock ? getBlockText(firstNonEmptyBlock).trim() || defaultNoteTitle : defaultNoteTitle;
};
