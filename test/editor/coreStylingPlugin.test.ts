import { Selector } from './selectors';
import { getContentState, loadApp, pressKey, getState } from './transport';

beforeEach(async () => {
  await loadApp();
});

describe('coreStylingPlugin', () => {
  describe('steps', () => {
    describe('removeInlineStyles', () => {
      describe('deleting decorator characters', () => {
        test('backspacing the first of a two-character leading decorator sequence should remove the style', async () => {
          await page.type(Selector.ContentEditable, '**Bold**');
          await pressKey('ArrowLeft', 7);
          await pressKey('Backspace');
          expect(await getState()).toMatchSnapshot();
        });
      });
    });
  });
});
