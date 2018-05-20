import { DraftBlockType } from 'draft-js';
import { values } from 'lodash';
import { InsertionEdit } from '../../../utils/draftUtils';
import { OrderedSet } from 'immutable';

export interface CoreBlockDefinition {
  type: DraftBlockType;
  pattern: RegExp;
  expandable?: boolean;
};

export interface CoreStaticBlockDefinition extends CoreBlockDefinition {
  expandable?: false;
  canonicalPattern: string;
}

export interface CoreExpandableBlockDefinition extends CoreBlockDefinition {
  expandable: true;
  canonicalPattern: Pick<InsertionEdit, 'text' | 'style'>[];
}

export const blocks: { [K in DraftBlockType]?: CoreStaticBlockDefinition | CoreExpandableBlockDefinition } = {
  'header-one': {
    type: 'header-one',
    pattern: /^(#) /,
    expandable: true,
    canonicalPattern: [
      { text: '#', style: OrderedSet(['core.block.decorator']) },
      { text: ' ' }
    ]
  },
  'header-two': {
    type: 'header-two',
    pattern: /^(##) /,
    expandable: true,
    canonicalPattern: [
      { text: '##', style: OrderedSet(['core.block.decorator']) },
      { text: ' ' }
    ]
  },
  'header-three': {
    type: 'header-three',
    pattern: /^(###) /,
    expandable: true,
    canonicalPattern: [
      { text: '###', style: OrderedSet(['core.block.decorator']) },
      { text: ' ' }
    ]
  },
  'header-four': {
    type: 'header-four',
    pattern: /^(####) /,
    expandable: true,
    canonicalPattern: [
      { text: '####', style: OrderedSet(['core.block.decorator']) },
      { text: ' ' }
    ]
  },
  'header-five': {
    type: 'header-five',
    pattern: /^(#####) /,
    expandable: true,
    canonicalPattern: [
      { text: '#####', style: OrderedSet(['core.block.decorator']) },
      { text: ' ' }
    ]
  },
  'header-six': {
    type: 'header-six',
    pattern: /^(######) /,
    expandable: true,
    canonicalPattern: [
      { text: '######', style: OrderedSet(['core.block.decorator']) },
      { text: ' ' }
    ]
  },
  'unordered-list-item': {
    type: 'unordered-list-item',
    pattern: /^- /,
    expandable: false,
    canonicalPattern: '- '
  }
};

export const blockValues = values(blocks);