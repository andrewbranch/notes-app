import * as React from 'react';
import * as memoize from 'memoizee';
import { escapeRegExp, uniq, flatMap } from 'lodash';
import { Styles } from '../../../ui/types';
import { values } from 'lodash';
const styleVariables: Styles = require('../../../styles/variables.scss');

export type CoreStaticStyleName = 'core.styling.decorator';
export type CoreExpandableStyleName = 'core.styling.inlineCode' | 'BOLD' | 'ITALIC' | 'UNDERLINE' | 'STRIKETHROUGH';
export type CoreStyleName = CoreStaticStyleName | CoreExpandableStyleName;

export interface CoreStyleDefinition {
  name: CoreStyleName;
  allowsNesting: boolean;
  styleAttributes: React.CSSProperties;
}

export interface ExpandableStyleDefinition extends CoreStyleDefinition {
  name: CoreExpandableStyleName;
  pattern: string;
}

export const expandableStyles: { [K in CoreExpandableStyleName]: ExpandableStyleDefinition } = {
  'core.styling.inlineCode': {
    name: 'core.styling.inlineCode',
    pattern: '`',
    allowsNesting: false,
    styleAttributes: {
      fontFamily: 'monaco, consolas, monospace',
      fontSize: '80%',
      backgroundColor: styleVariables.warmGray10
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

export const staticStyles: { [K in CoreStaticStyleName]: CoreStyleDefinition } = {
  'core.styling.decorator': {
    name: 'core.styling.decorator',
    allowsNesting: false,
    styleAttributes: {
      color: 'rgba(0, 0, 0, 0.3)'
    }
  }
};

const expandableStyleKeys = Object.keys(expandableStyles);
const staticStyleKeys = Object.keys(staticStyles);
export const expandableStyleValues = values(expandableStyles);
export const staticStyleValues = values(staticStyles);
export const styleValues = [...expandableStyleValues, ...staticStyleValues];
export const TRIGGER_CHARACTERS = uniq(flatMap(expandableStyleValues, s => s.pattern.split('')));
export const isStaticStyle = (styleKey: string): styleKey is CoreStaticStyleName => staticStyleKeys.includes(styleKey)
export const isCoreStyle = (styleKey: string): boolean => styleKey.startsWith('core.styling') || isExpandableStyle(styleKey);
export const isExpandableStyle = (styleKey: string): styleKey is CoreExpandableStyleName => expandableStyleKeys.includes(styleKey);
export const isStyleDecorator = (styleKey: string): styleKey is 'core.styling.decorator' => styleKey === 'core.styling.decorator';
export const getPatternRegExp = memoize((styleKey: CoreExpandableStyleName) => {
  const escapedPattern = escapeRegExp(expandableStyles[styleKey].pattern);
  return new RegExp(`${escapedPattern}(?:(?!${escapedPattern}).)+${escapedPattern}`, 'g');
});
