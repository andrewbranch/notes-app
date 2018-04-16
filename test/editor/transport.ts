import * as path from 'path';
import { convertFromRaw, SelectionState } from 'draft-js';

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