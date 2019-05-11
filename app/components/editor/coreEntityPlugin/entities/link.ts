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
  getCollapseEdits: (data, offset, length, edit) => [{
    ...edit,
    type: 'insertion',
    offset,
    deletionLength: 1,
    text: ''
  }, {
    ...edit,
    type: 'insertion',
    offset: offset + 1 + data.text.length,
    deletionLength: 3 + data.href.length,
    text: ''
  }],
  getExpandEdits: (data, offset, length, edit) => [{
    ...edit,
    type: 'insertion',
    offset,
    text: '['
  }, {
    ...edit,
    type: 'insertion',
    offset: offset + length,
    text: `](${data.href})`
  }],
  adjustSelectionOnExpand: (offset, data) => {
    if (offset === 0) return 0;
    if (offset < data.text.length) return 1;
    return 4 + data.href.length;
  },
  mutability: 'MUTABLE'
};
