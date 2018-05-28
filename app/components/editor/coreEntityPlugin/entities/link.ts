import { CoreExpandableEntityDefinition, EntityData } from './types';

export interface LinkData extends EntityData {
  text: string;
  href: string;
}

export type LinkEntityDefinition = CoreExpandableEntityDefinition<'link', LinkData>;

export const linkEntityDefinition: LinkEntityDefinition = {
  type: 'link',
  pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
  getData: match => ({ text: match[1], href: match[2] }),
  getCollapsedText: data => data.text,
  getExpandedText: data => `[${data.text}](${data.href})`,
  adjustSelectionOnExpand: (offset, data) => {
    if (offset === 0) return 0;
    if (offset < data.text.length) return 1;
    return 4 + data.href.length;
  },
  mutability: 'MUTABLE'
};
