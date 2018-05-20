import { loadApp, typeText, getState, pressKey } from './transport';

const assertBlockType = async (blockType: string) => expect((await getState()).content.getFirstBlock().getType()).toBe(blockType);

beforeEach(async () => {
  await loadApp();
});

describe('coreBlockPlugin', () => {
  describe('headings', () => {
    test('doesn’t create a heading when typing hashes before space is pressed', async () => {
      await typeText('#');
      await assertBlockType('unstyled');
    });

    test('creates a heading after typing some hashes and a space', async () => {
      await typeText('# ');
      await assertBlockType('header-one');
      expect(await getState()).toMatchSnapshot();
    });

    test('creates a heading after typing a hash if there’s a trailing space', async () => {
      await typeText(' ');
      await pressKey('ArrowLeft');
      await typeText('#');
      await assertBlockType('header-one');
    });

    test('changes heading type when modifying hashes', async () => {
      await typeText('# ');
      await pressKey('ArrowLeft');
      await typeText('#');
      await assertBlockType('header-two');
      await pressKey('Backspace');
      await assertBlockType('header-one');
    });

    test('doesn’t create a heading if the hashes aren’t at the beginning of the block', async () => {
      await typeText(' # ');
      await assertBlockType('unstyled');
    });

    test('resets block type if the heading sequence becomes invalid', async () => {
      await typeText('## ');
      await assertBlockType('header-two');
      await pressKey('ArrowLeft');
      await typeText('x');
      await assertBlockType('unstyled');
      await pressKey('Backspace');
      await assertBlockType('header-two');
      await pressKey('ArrowLeft');
      await typeText('x');
      await assertBlockType('unstyled');
    });
  });

  describe('unordered lists', () => {
    test('creates a list after typing the control sequence', async () => {
      await typeText('- ');
      await assertBlockType('unordered-list-item');
      expect((await getState()).content.getPlainText()).toBe('');
    });
  });

  describe('decorator sequence styles', () => {
    test('styles decorator characters when a block is created', async () => {
      await typeText('## ');
      expect(await getState()).toMatchSnapshot();
    });

    test('removes other styles when styling decorator characters', async () => {
      await typeText('`#`# ');
      expect(await getState()).toMatchSnapshot();
    });

    test('unstyles decorator characters when block is destroyed', async () => {
      await typeText('## ');
      await pressKey('Backspace');
      expect(await getState()).toMatchSnapshot();
    });

    test('styles decorator characters when a block is expanded', async () => {
      await typeText('## Hello');
      await pressKey('Enter');
      await pressKey('Backspace');
      expect(await getState()).toMatchSnapshot();
    });
  });

  describe('general editing', () => {
    test('Maintains/expands block when forward-deleting the preceding block', async () => {
      await pressKey('Enter');
      await typeText('# Hello');
      await pressKey('ArrowUp');
      await pressKey('Delete');
      await assertBlockType('header-one');
      expect(await getState()).toMatchSnapshot();
    });

    test('Maintains block when backspacing the beginning of the block into an empty preceding block', async () => {
      await pressKey('Enter');
      await typeText('# X');
      await pressKey('ArrowLeft', 3);
      await pressKey('Backspace');
      await assertBlockType('header-one');
      expect(await getState()).toMatchSnapshot();
    });
  });
});
