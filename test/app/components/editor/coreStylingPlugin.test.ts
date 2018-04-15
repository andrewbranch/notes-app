import '../../../utils/enzymeConfig';
import { createEditorProvider, Key } from './editorProvider';
import { boldWithSelectionAtEnd, boldWithSelectionAtStart, boldHelloSelectedFrom4ToEnd, boldHelloSelectedFrom7ToEnd, helloBoldSelectedFromStartTo10, helloBoldSelectedFromStartTo7, italicWithSelectionAtEnd } from './fixtures';

describe('coreStylingPlugin', () => {
  describe('steps', () => {
    describe('removeInlineStyles', () => {
      describe('deleting decorator characters', () => {
        test('backspacing the first of a two-character leading decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtStart });
          await provider.setSelection({ focusOffset: 1, anchorOffset: 1 });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('backspacing the second of a two-character leading decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtStart });
          await provider.setSelection({ focusOffset: 2, anchorOffset: 2 });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('backspacing the first of a two-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ focusOffset: 7, anchorOffset: 7 });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('backspacing the second of a two-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('forward-deleting the first of a two-character leading decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtStart });
          await provider.pressKey(Key.DELETE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('forward-deleting the second of a two-character leading decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtStart });
          await provider.setSelection({ focusOffset: 1, anchorOffset: 1 });
          await provider.pressKey(Key.DELETE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('forward-deleting the first of a two-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ focusOffset: 6, anchorOffset: 6 });
          await provider.pressKey(Key.DELETE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('forward-deleting the second of a two-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ focusOffset: 7, anchorOffset: 7 });
          await provider.pressKey(Key.DELETE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('deleting a range including the first character of a two-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ focusOffset: 7, anchorOffset: 4 });
          await provider.pressKey(Key.DELETE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('replacing a range including the first character of a two-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ focusOffset: 7, anchorOffset: 4 });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('deleting a range including the trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldHelloSelectedFrom4ToEnd });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('replacing a range including the trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldHelloSelectedFrom4ToEnd });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('deleting a range including part of the trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldHelloSelectedFrom7ToEnd });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('replacing a range including part of a two-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldHelloSelectedFrom7ToEnd });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test.skip('replacing a range including the one-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: italicWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 7, focusOffset: 8 });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('replacing a range including the first character of a two-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ focusOffset: 4, anchorOffset: 1 });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('deleting a range including the leading decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: helloBoldSelectedFromStartTo10 });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('replacing a range including the leading decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: helloBoldSelectedFromStartTo10 });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('deleting a range including part of the leading decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: helloBoldSelectedFromStartTo7 });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test.skip('replacing a range including part of the leading decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: helloBoldSelectedFromStartTo7 });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test.skip('replacing the first character of a leading two-character decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtStart });
          await provider.setSelection({ focusOffset: 1 });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });
      });

      describe('editing within the range', () => {
        test('deleting the entire contents of a range should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 2, focusOffset: 6 });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('backspacing the last character inside a range should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 6, focusOffset: 6 });
          await provider.pressKey(Key.BACKSPACE, 4);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('forward-deleting the last character inside a range should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 2, focusOffset: 2 });
          await provider.pressKey(Key.DELETE, 4);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('inserting a character in the middle of a leading two-character decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 1, focusOffset: 1 });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('inserting a character in the middle of a trailing two-character decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 7, focusOffset: 7 });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });
      });

      describe('splitting a range into two blocks', () => {
        it('splitting a range in the middle should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 4, focusOffset: 4 });
          await provider.pressKey(Key.RETURN);
          const blocks = provider.getEditorState().getCurrentContent().getBlocksAsArray();
          expect(blocks).toHaveLength(2);
          expect(blocks.every(block => block.getCharacterList().every(c => c!.getStyle().size === 0))).toBe(true);
          expect(blocks[0].getText()).toBe('**Bo');
          expect(blocks[1].getText()).toBe('ld**');
        });

        it('splitting a range in the middle of a leading two-character decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 1, focusOffset: 1 });
          await provider.pressKey(Key.RETURN);
          const blocks = provider.getEditorState().getCurrentContent().getBlocksAsArray();
          expect(blocks).toHaveLength(2);
          expect(blocks.every(block => block.getCharacterList().every(c => c!.getStyle().size === 0))).toBe(true);
          expect(blocks[0].getText()).toBe('*');
          expect(blocks[1].getText()).toBe('*Bold**');
        });

        it('splitting a range in the middle of a trailing two-character decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 7, focusOffset: 7 });
          await provider.pressKey(Key.RETURN);
          const blocks = provider.getEditorState().getCurrentContent().getBlocksAsArray();
          expect(blocks).toHaveLength(2);
          expect(blocks.every(block => block.getCharacterList().every(c => c!.getStyle().size === 0))).toBe(true);
          expect(blocks[0].getText()).toBe('**Bold*');
          expect(blocks[1].getText()).toBe('*');
        });

        it('splitting a block right before a style range should not remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtStart });
          await provider.pressKey(Key.RETURN);
          const blocks = provider.getEditorState().getCurrentContent().getBlocksAsArray();
          expect(blocks).toHaveLength(2);
          expect(blocks[0].getText()).toBe('');
          expect(blocks[1].getText()).toBe('**Bold**');
          const decoratorCharacterStyles = blocks[1].getCharacterList().slice(0, 2).map(c => c!.getStyle()).toArray();
          expect(decoratorCharacterStyles).toHaveLength(2);
          expect(decoratorCharacterStyles.every(styles => styles.includes('BOLD'))).toBe(true);
          expect(decoratorCharacterStyles.every(styles => styles.includes('core.styling.decorator'))).toBe(true);
        });

        it('splitting a block right after a style range should not remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.pressKey(Key.RETURN);
          const blocks = provider.getEditorState().getCurrentContent().getBlocksAsArray();
          expect(blocks).toHaveLength(2);
          expect(blocks[0].getText()).toBe('Bold');
          expect(blocks[1].getText()).toBe('');
          const characterStyles = blocks[0].getCharacterList().map(c => c!.getStyle()).toArray();
          expect(characterStyles.every(styles => styles.includes('BOLD'))).toBe(true);
        });
      });

      describe('writing after a style range', () => {
        it('a character inserted immediately after a style range should not be styled', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.typeText('x');
          expect(provider.getEditorState()).toMatchSnapshot();
        });
      });
    });
  });
});
