import * as React from 'react';
import * as memoize from 'memoizee';
import { escapeRegExp, uniq, flatMap } from 'lodash';
import { ContentState, Modifier, ContentBlock } from 'draft-js';
import { createSelectionWithRange, InsertionEdit } from '../../../utils/draft-utils';
import { Styles } from '../../../ui/types';
import { values } from 'lodash';
const styleVariables: Styles = require('../../../styles/variables.scss');

export type CoreInlineStyleName = 'core.styling.inlineCode' | 'core.styling.bold' | 'core.styling.italic' | 'core.styling.underline' | 'core.styling.strikethrough';

export interface InlineStyleDefinition {
  name: CoreInlineStyleName;
  pattern: string;
  allowsNesting: boolean;
  styleAttributes: React.CSSProperties;
}

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
  },

  'core.styling.italic': {
    name: 'core.styling.italic',
    pattern: '_',
    allowsNesting: true,
    styleAttributes: {
      fontStyle: 'italic'
    }
  },

  'core.styling.underline': {
    name: 'core.styling.underline',
    pattern: '__',
    allowsNesting: true,
    styleAttributes: {
      textDecoration: 'underline'
    }
  },

  'core.styling.strikethrough': {
    name: 'core.styling.strikethrough',
    pattern: '~',
    allowsNesting: true,
    styleAttributes: {
      textDecoration: 'line-through'
    }
  }
};

export const styleValues = values(styles);
export const TRIGGER_CHARACTERS = uniq(flatMap(styleValues, s => s.pattern.split('')));
export const isCoreStyle = (styleKey: string): styleKey is CoreInlineStyleName => styleKey.startsWith('core.styling');
export const getPatternRegExp = memoize((styleKey: CoreInlineStyleName) => {
  const escapedPattern = escapeRegExp(styles[styleKey].pattern);
  const characters = escapeRegExp(uniq(styles[styleKey].pattern.split('')).join(''));
  return new RegExp(`${escapedPattern}[^${characters}]+${escapedPattern}`, 'g');
});
