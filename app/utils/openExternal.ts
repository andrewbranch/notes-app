import { shell } from 'electron';
import { isMacOS } from './platform';

export const openExternal = (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  const anchor = event.currentTarget;
  if (anchor && 'href' in anchor) {
    shell.openExternal(anchor.href);
  }
};

export const openExternalOnCmdModifier = (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  if (isMacOS && event.metaKey || !isMacOS && event.ctrlKey) {
    openExternal(event);
  }
};
