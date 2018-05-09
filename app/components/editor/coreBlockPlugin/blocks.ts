import { DraftBlockType } from 'draft-js';
import { values } from 'lodash';

export interface CoreBlockDefinition {
  type: DraftBlockType;
  pattern: RegExp;
  expandable?: boolean;
};

export interface CoreStaticBlockDefinition extends CoreBlockDefinition {
  expandable?: false;
}

export interface CoreExpandableBlockDefinition extends CoreBlockDefinition {
  expandable: true;
  canonicalPattern: string;
}

export const blocks: { [K in DraftBlockType]?: CoreStaticBlockDefinition | CoreExpandableBlockDefinition } = {
  'header-one': {
    type: 'header-one',
    pattern: /^# /,
    expandable: true,
    canonicalPattern: '# '
  },
  'header-two': {
    type: 'header-two',
    pattern: /^## /,
    expandable: true,
    canonicalPattern: '## '
  },
  'header-three': {
    type: 'header-three',
    pattern: /^### /,
    expandable: true,
    canonicalPattern: '### '
  },
  'header-four': {
    type: 'header-four',
    pattern: /^#### /,
    expandable: true,
    canonicalPattern: '#### '
  },
  'header-five': {
    type: 'header-five',
    pattern: /^##### /,
    expandable: true,
    canonicalPattern: '##### '
  },
  'header-six': {
    type: 'header-six',
    pattern: /^###### /,
    expandable: true,
    canonicalPattern: '###### '
  },
  'unordered-list-item': {
    type: 'unordered-list-item',
    pattern: /^ ?[-*] /,
    expandable: false
  }
};

export const MAX_BLOCK_SEQ_LENGTH = 7; // header-six
export const blockValues = values(blocks);