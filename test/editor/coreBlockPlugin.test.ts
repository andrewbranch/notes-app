import { loadApp, typeText, getState, pressKey, withShift } from './transport';

const assertBlockType = async (blockType: string) => {
  const { content, selection } = await getState();
  expect(content.getBlockForKey(selection.getStartKey()).getType()).toBe(blockType);
};

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

    test('resets block type if the heading sequence becomes invalid by splitting the block', async () => {
      await typeText('## ');
      await pressKey('ArrowLeft', 2);
      await pressKey('Enter');
      await pressKey('Enter');
      expect(await getState()).toMatchSnapshot();
    });
  });

  describe('unordered lists', () => {
    test('creates a list after typing the control sequence', async () => {
      await typeText('- ');
      await assertBlockType('unordered-list-item');
      expect((await getState()).content.getPlainText()).toBe('');
    });

    test('places the selection in the right place when creating a list item', async () => {
      await pressKey('Enter');
      await typeText('- ');
      expect(await getState()).toMatchSnapshot();
    });

    test('backspacing resets the list item and inserts the control sequence minus one character', async () => {
      await typeText('- ');
      await pressKey('Backspace');
      await assertBlockType('unstyled');
      expect((await getState()).content.getPlainText()).toBe('-');
    });

    test('backspacing a range including the first character of a list item works normally', async () => {
      await typeText('- x');
      await withShift('ArrowLeft');
      await pressKey('Backspace');
      await assertBlockType('unordered-list-item');
      expect((await getState()).content.getPlainText()).toBe('');
    });

    test('pressing enter after a filled list item adds another list item', async () => {
      await typeText('- one');
      await pressKey('Enter');
      await assertBlockType('unordered-list-item');
      expect(await getState()).toMatchSnapshot();      
    });

    test('pressing enter after an empty list item converts the list item to an unstyled block', async () => {
      await typeText('- ');
      await pressKey('Enter');
      await assertBlockType('unstyled');
      expect((await getState()).content.getPlainText()).toBe('');
    });

    test('can’t convert a list item directly to another block type', async () => {
      await typeText('- # ');
      await assertBlockType('unordered-list-item');
      expect((await getState()).content.getPlainText()).toBe('# ');
    });
  });

  describe('blockquotes', async () => {
    test('creates a blockquote after typing the control sequence', async () => {
      await typeText('> Hello');
      await assertBlockType('blockquote');
      expect((await getState()).content.getPlainText()).toBe('Hello');
    });

    test('pressing enter at the end of a blockquote creates an unstyled block', async () => {
      await typeText('> Four score and seven years ago');
      await pressKey('Enter');
      await assertBlockType('unstyled');
    });

    test('pressing enter in the middle of a blockquote creates an unstyled block', async () => {
      await typeText('> Four score and seven years ago');
      await pressKey('ArrowLeft', 3);
      await pressKey('Enter');
      await assertBlockType('unstyled');
      expect((await getState()).content.getLastBlock().getText()).toBe('ago');
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

    test('unstyles decorator characters when they get stripped off and are no longer decorator characters', async () => {
      await typeText('## ');
      await pressKey('ArrowLeft', 2);
      await typeText(' ');
      expect(await getState()).toMatchSnapshot();
    });
  });

  describe('expandable blocks', () => {
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

    test('Expands blocks with inline styles in them', async () => {
      await typeText('# `Title`');
      await pressKey('Enter');
      await pressKey('ArrowUp');
      await assertBlockType('header-one');
      expect((await getState()).content.getPlainText()).toContain('# `Title`');
    });

    test('Pressing enter after an expandable block starts an unstyled block', async () => {
      await typeText('# Hello');
      await pressKey('Enter');
      await assertBlockType('unstyled');
    });
  });
});
