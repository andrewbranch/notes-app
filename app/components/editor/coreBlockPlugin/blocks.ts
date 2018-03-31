import { DraftBlockType } from 'draft-js';
import { values } from 'lodash';

export type CoreBlockDefinition = {
  type: DraftBlockType;
  pattern: RegExp;
  expandable?: boolean;
};

export const blocks: { [K in DraftBlockType]?: CoreBlockDefinition } = {
  'header-one': {
    type: 'header-one',
    pattern: /^# /,
    expandable: true
  },
  'header-two': {
    type: 'header-two',
    pattern: /^## /,
    expandable: true
  },
  'header-three': {
    type: 'header-three',
    pattern: /^### /,
    expandable: true
  },
  'header-four': {
    type: 'header-four',
    pattern: /^#### /,
    expandable: true
  },
  'header-five': {
    type: 'header-five',
    pattern: /^##### /,
    expandable: true
  },
  'header-six': {
    type: 'header-six',
    pattern: /^###### /,
    expandable: true
  },
  'unordered-list-item': {
    type: 'unordered-list-item',
    pattern: / ?[-*] /,
    expandable: false
  }
};

export const blockValues = values(blocks);