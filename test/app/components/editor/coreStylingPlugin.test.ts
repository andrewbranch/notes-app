import '../../../utils/enzymeConfig';
import { createEditorProvider, Key } from './editorProvider';
import { boldWithSelectionAtEnd, boldWithSelectionAtStart } from './fixtures';

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
          await provider.pressKey(Key.LEFT);
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });

        test('backspacing the second of a two-character trailing decorator sequence should remove the style', async () => {
          const provider = await createEditorProvider({ initialEditorState: boldWithSelectionAtEnd });
          await provider.pressKey(Key.BACKSPACE);
          expect(provider.getEditorState()).toMatchSnapshot();
        });
      });
    });
  });
});
