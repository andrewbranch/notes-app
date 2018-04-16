import * as path from 'path';
import { convertFromRaw, SelectionState } from 'draft-js';
import { Selector } from './selectors';

export async function loadApp() {
  return page.goto(`http://localhost:${process.env.PORT || 51423}`);
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

export async function withShift(fn: () => Promise<void>): Promise<void>
export async function withShift(key: string, times?: number): Promise<void>
export async function withShift(keyOrFn: string | (() => Promise<void>), times?: number): Promise<void> {
  await page.keyboard.down('Shift');
  if (typeof keyOrFn === 'function') {
    await keyOrFn();
  } else {
    await pressKey(keyOrFn, times);
  }
  await page.keyboard.up('Shift');
}

export async function typeText(text: string) {
  return page.type(Selector.ContentEditable, text);
}