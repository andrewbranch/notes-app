import { DraftBlockType } from 'draft-js';
import { values } from 'lodash';

export type CoreBlockDefinition = {
  type: DraftBlockType;
  pattern: string;
  expand?: boolean;
};

export const blocks: { [K in DraftBlockType]?: CoreBlockDefinition } = {
  'header-one': {
    type: 'header-one',
    pattern: '# ',
    expand: true
  },
  'header-two': {
    type: 'header-two',
    pattern: '## ',
    expand: true
  },
  'header-three': {
    type: 'header-three',
    pattern: '### ',
    expand: true
  },
  'header-four': {
    type: 'header-four',
    pattern: '#### ',
    expand: true
  },
  'header-five': {
    type: 'header-five',
    pattern: '##### ',
    expand: true
  },
  'header-six': {
    type: 'header-six',
    pattern: '###### ',
    expand: true
  }
};

export const blockValues = values(blocks);