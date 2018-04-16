import { Selector } from './selectors';
import { getContentState, loadApp } from './transport';

beforeEach(async () => {
  await loadApp();
});

test('it works', async () => {
  await page.type(Selector.ContentEditable, '**hello**');
  const text = (await getContentState()).getPlainText();
  expect(text).toBe('**hello**');
});
