import * as React from 'react';
import * as memoize from 'memoizee';
import { escapeRegExp, uniq, flatMap } from 'lodash';
import { Styles } from '../../../ui/types';
import { values } from 'lodash';
const styleVariables: Styles = require('../../../styles/variables.scss');

export type CoreInlineStyleName = 'core.styling.inlineCode' | 'BOLD' | 'ITALIC' | 'UNDERLINE' | 'STRIKETHROUGH';

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

  'BOLD': {
    name: 'BOLD',
    pattern: '**',
    allowsNesting: true,
    styleAttributes: {
      fontWeight: 'bold'
    }
  },

  'ITALIC': {
    name: 'ITALIC',
    pattern: '_',
    allowsNesting: true,
    styleAttributes: {
      fontStyle: 'italic'
    }
  },

  'UNDERLINE': {
    name: 'UNDERLINE',
    pattern: '__',
    allowsNesting: true,
    styleAttributes: {
      textDecoration: 'underline'
    }
  },

  'STRIKETHROUGH': {
    name: 'STRIKETHROUGH',
    pattern: '~',
    allowsNesting: true,
    styleAttributes: {
      textDecoration: 'line-through'
    }
  }
};

const inlineStyleKeys = Object.keys(styles);
export const styleValues = values(styles);
export const TRIGGER_CHARACTERS = uniq(flatMap(styleValues, s => s.pattern.split('')));
export const isCoreStyle = (styleKey: string): styleKey is CoreInlineStyleName => inlineStyleKeys.includes(styleKey);
export const getPatternRegExp = memoize((styleKey: CoreInlineStyleName) => {
  const escapedPattern = escapeRegExp(styles[styleKey].pattern);
  const characters = escapeRegExp(uniq(styles[styleKey].pattern.split('')).join(''));
  return new RegExp(`${escapedPattern}[^${characters}]+${escapedPattern}`, 'g');
});
