import { loadApp, pressKey, getState, withShift, typeText, deleteToBeginningOfLine, cleanup } from './transport';
import { isMacOS } from '../../app/utils/platform';

beforeEach(async () => {
  await loadApp();
});

describe('coreStylingPlugin', () => {
  describe('steps', () => {
    describe('addInlineStyles', () => {
      describe('Built-in styles', async () => {
        test('typing bold sequence should work', async () => {
          await typeText('Not bold, **bold**');
          expect(await getState()).toMatchSnapshot();
        });

        test('typing italic sequence should work', async () => {
          await typeText('Not italic, _italic_');
          expect(await getState()).toMatchSnapshot();
        });

        test('typing code sequence should work', async () => {
          await typeText('Not code, `code`');
          expect(await getState()).toMatchSnapshot();
        });

        test.skip('typing underline sequence should work', async () => {
          await typeText('Not underlined, __underlined__');
          expect(await getState()).toMatchSnapshot();
        });

        test('typing strikethrough sequence should work', async () => {
          await typeText('Not strikethrough, ~strikethrough~');
          expect(await getState()).toMatchSnapshot();
        });
      });
    });

    describe('removeInlineStyles', () => {
      describe('deleting decorator characters', () => {
        test('backspacing the first of a two-character leading decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 7);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('backspacing the second of a two-character leading decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 6);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('backspacing the first of a two-character trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 1);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('backspacing the second of a two-character trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('backspacing a one-character trailing decorator sequence should remove the style', async () => {
          await typeText('_Italic_');
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test.skip('replacing the trailing decorator sequence should remove the style', async () => {
          await typeText('_Italic_');
          await withShift('ArrowLeft');
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('backspacing a one-character leading decorator sequence should remove the style', async () => {
          await typeText('_Italic_');
          await pressKey('ArrowLeft', 7);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('replacing the leading decorator sequence should remove the style', async () => {
          await typeText('_Italic_');
          await pressKey('ArrowLeft', 7);
          await withShift('ArrowLeft');
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('forward-deleting the first of a two-character leading decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 8);
          await pressKey('Delete');
          expect(await getState()).toMatchSnapshot();
        });

        test('forward-deleting the second of a two-character leading decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 7);
          await pressKey('Delete');
          expect(await getState()).toMatchSnapshot();
        });

        test('forward-deleting the first of a two-character trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 2);
          await pressKey('Delete');
          expect(await getState()).toMatchSnapshot();
        });

        test('forward-deleting the second of a two-character trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 1);
          await pressKey('Delete');
          expect(await getState()).toMatchSnapshot();
        });

        test('deleting a range including the first character of a two-character trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 1);
          await withShift('ArrowLeft', 3);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('replacing a range including the first character of a two-character trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 1);
          await withShift('ArrowLeft', 3);
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('deleting a range including the trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await withShift('ArrowLeft', 4);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('replacing a range including the trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await withShift('ArrowLeft', 4);
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('deleting a range including part of the trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold** hello');
          await withShift('ArrowLeft', 7);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('replacing a range including part of a two-character trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold** hello');
          await withShift('ArrowLeft', 7);
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('replacing a range including the first character of a two-character trailing decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft');
          await withShift('ArrowLeft', 3);
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('deleting a range including the leading decorator sequence should remove the style', async () => {
          await typeText('Hello **bold**');
          await pressKey('ArrowLeft', 4);
          await withShift('ArrowLeft', 4);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('replacing a range including the leading decorator sequence should remove the style', async () => {
          await typeText('Hello **bold**');
          await pressKey('ArrowLeft', 4);
          await withShift('ArrowLeft', 6);
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('deleting a range including part of the leading decorator sequence should remove the style', async () => {
          await typeText('Hello **bold**');
          await pressKey('ArrowLeft', 4);
          await pressKey('ArrowLeft', 3);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('replacing a range including part of the leading decorator sequence should remove the style', async () => {
          await typeText('Hello **bold**');
          await pressKey('ArrowLeft', 4);
          await pressKey('ArrowLeft', 3);
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('replacing the first character of a leading two-character decorator sequence should remove the style (start of block)', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 8);
          await withShift('ArrowRight');
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('replacing the first character of a leading two-character decorator sequence should remove the style (middle of block)', async () => {
          await typeText(' **Bold**');
          await pressKey('ArrowLeft', 8);
          await withShift('ArrowRight');
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });
      });

      describe('editing within the range', () => {
        test('deleting the entire contents of a range should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 2);
          await withShift('ArrowLeft', 4);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });

        test('backspacing the last character inside a range should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 2);
          await pressKey('Backspace', 4);
          expect(await getState()).toMatchSnapshot();
        });

        test('forward-deleting the last character inside a range should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 6);
          await pressKey('Delete', 4);
          expect(await getState()).toMatchSnapshot();
        });

        test('inserting a character in the middle of a leading two-character decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 7);
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });

        test('inserting a character in the middle of a trailing two-character decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft');
          await typeText('a');
          expect(await getState()).toMatchSnapshot();
        });
      });

      describe('splitting a range into two blocks', () => {
        it('splitting a range in the middle should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 4);
          await pressKey('Enter');
          expect(await getState()).toMatchSnapshot();
        });

        it('splitting a range in the middle of a leading two-character decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 7);
          await pressKey('Enter');
          expect(await getState()).toMatchSnapshot();
        });

        it('splitting a range in the middle of a trailing two-character decorator sequence should remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft');
          await pressKey('Enter');
          expect(await getState()).toMatchSnapshot();
        });

        it('splitting a block right before a style range should not remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('ArrowLeft', 8);
          await pressKey('Enter');
          expect(await getState()).toMatchSnapshot();
        });

        it('splitting a block right after a style range should not remove the style', async () => {
          await typeText('**Bold**');
          await pressKey('Enter');
          expect(await getState()).toMatchSnapshot();
        });
      });

      describe('writing after a style range', () => {
        it('a character inserted immediately after a style range should not be styled', async () => {
          await typeText('**Bold**');
          await typeText('x');
          expect(await getState()).toMatchSnapshot();
        });
      });
    });
  });

  describe('general editing', () => {
    if (isMacOS) {
      test('deleting a line with two-character decorator style range at the beginning should work', async () => {
        await typeText('**Bold** hello');
        await deleteToBeginningOfLine();
        expect(await getState()).toMatchSnapshot();
      });

      test('deleting a line with two-character decorator style range at the end should work', async () => {
        await typeText('Hello **bold**');
        await deleteToBeginningOfLine();
        expect(await getState()).toMatchSnapshot();
      });

      test('deleting a line with one-character decorator style range at the beginning should work', async () => {
        await typeText('_Italic_ hello');
        await deleteToBeginningOfLine();
        expect(await getState()).toMatchSnapshot();
      });

      test('deleting a line with two-character decorator style range at the end should work', async () => {
        await typeText('Hello _italic_');
        await deleteToBeginningOfLine();
        expect(await getState()).toMatchSnapshot();
      });

      test('deleting a line with style range in the middle should work', async () => {
        await typeText('Hello **bold** hi');
        await deleteToBeginningOfLine();
        expect(await getState()).toMatchSnapshot();
      });
    }
  });
});
