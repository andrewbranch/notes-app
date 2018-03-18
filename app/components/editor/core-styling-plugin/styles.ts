import * as React from 'react';
import * as memoize from 'memoizee';
import { escapeRegExp, uniq } from 'lodash';
import { ContentState, Modifier, ContentBlock } from 'draft-js';
import { createSelectionWithRange, InsertionEdit } from '../../../utils/draft-utils';
import { Styles } from '../../../ui/types';
import { values } from 'lodash';
const styleVariables: Styles = require('../../../styles/variables.scss');

export type CoreInlineStyleName = 'core.styling.bold' | 'core.styling.inlineCode';

export interface InlineStyleDefinition {
  name: CoreInlineStyleName;
  pattern: string;
  allowsNesting: boolean;
  styleAttributes: React.CSSProperties;
}


export const TRIGGER_CHARACTERS = ['`', '*'];

export const styles: { [K in CoreInlineStyleName]: InlineStyleDefinition } = {
  'core.styling.inlineCode': {
    name: 'core.styling.inlineCode',
    pattern: '`',
    allowsNesting: false,
    styleAttributes: {
      fontFamily: 'monaco, consolas, monospace',
      fontSize: '80%',
      backgroundColor: styleVariables.warmGray10,
      borderRadius: 2
    }
  },

  'core.styling.bold': {
    name: 'core.styling.bold',
    pattern: '**',
    allowsNesting: true,
    styleAttributes: {
      fontWeight: 'bold'
    }
  }
};

export const styleValues = values(styles);
export const isCoreStyle = (styleKey: string): styleKey is CoreInlineStyleName => styleKey.startsWith('core.styling');
export const getPatternRegExp = memoize((styleKey: CoreInlineStyleName) => {
  const escapedPattern = escapeRegExp(styles[styleKey].pattern);
  const characters = escapeRegExp(uniq(styles[styleKey].pattern.split('')).join(''));
  return new RegExp(`${escapedPattern}[^${characters}]+${escapedPattern}`, 'g');
});
