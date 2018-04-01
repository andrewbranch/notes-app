import '../../../utils/enzymeConfig';
import { createEditorProvider, Key } from './editorProvider';
import { boldWithSelectionAtEnd, boldWithSelectionAtStart, boldHelloSelectedFrom4ToEnd, boldHelloSelectedFrom7ToEnd, helloBoldSelectedFromStartTo10, helloBoldSelectedFromStartTo7 } from './fixtures';

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

        test.skip('replacing a range including part of the trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldHelloSelectedFrom7ToEnd });
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

        test('inserting a character in the middle of a two-character decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.setSelection({ anchorOffset: 1, focusOffset: 1 });
          await provider.typeText('a');
          expect(provider.getEditorState()).toMatchSnapshot();
        });
      });
    });
  });
});
