import * as path from 'path';
import { convertFromRaw, SelectionState } from 'draft-js';
import { Selector } from './selectors';
import { isMacOS } from '../../app/utils/platform';

export async function loadApp() {
  return page.goto(`file://${path.resolve(__dirname, 'app/index.html')}`);
}

export async function getContentState() {
  const content = await page.evaluate(() => (window as any).getContentState());
  return convertFromRaw(content);
}

export async function getSelectionState() {
  const selection = await page.evaluate(() => (window as any).getSelectionState());
  return new SelectionState(selection);
}

export async function getState() {
  return { content: await getContentState(), selection: await getSelectionState() };
}

export async function pressKey(key: string, times = 1) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key);
  }
}

export async function withModifierKey(modifier: string, fn: () => Promise<void>): Promise<void>
export async function withModifierKey(modifier: string, key: string, times?: number): Promise<void>
export async function withModifierKey(modifier: string, keyOrFn: string | (() => Promise<void>), times?: number): Promise<void>
export async function withModifierKey(modifier: string, keyOrFn: string | (() => Promise<void>), times?: number): Promise<void> {
  await page.keyboard.down(modifier);
  if (typeof keyOrFn === 'function') {
    await keyOrFn();
  } else {
    await pressKey(keyOrFn, times);
  }
  await page.keyboard.up(modifier);
}

export async function withShift(fn: () => Promise<void>): Promise<void>
export async function withShift(key: string, times?: number): Promise<void>
export async function withShift(keyOrFn: string | (() => Promise<void>), times?: number): Promise<void> {
  return withModifierKey('Shift', keyOrFn, times);
}

export async function withMeta(fn: () => Promise<void>): Promise<void>
export async function withMeta(key: string, times?: number): Promise<void>
export async function withMeta(keyOrFn: string | (() => Promise<void>), times?: number): Promise<void> {
  return withModifierKey('Meta', keyOrFn, times);
}

export async function deleteToBeginningOfLine() {
  if (!isMacOS) {
    throw new Error('Don’t know how to do that not on macOS');
  }

  return withMeta('Backspace');
}

export async function typeText(text: string) {
  return page.type(Selector.ContentEditable, text);
}