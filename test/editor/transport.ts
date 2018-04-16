import * as path from 'path';
import { convertFromRaw } from 'draft-js';

export async function loadApp() {
  return page.goto(`http://localhost:${process.env.PORT || 51423}`);
}

export async function getContentState() {
  const content = await page.evaluate(() => (window as any).getContentState());
  return convertFromRaw(content);
}