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
  applyStyle: (contentState: ContentState, blockOrKey: ContentBlock | string, start: number, end: number) => ContentState;
  styleAttributes: React.CSSProperties;
}

// TODO: these are no longer useful
export interface ExpandableInlineStyleDefinition extends InlineStyleDefinition {
  collapse: (edit: Pick<InsertionEdit, 'blockKey' | 'offset' | 'style' | 'disableUndo'>, expandedText: string) => InsertionEdit[];
  expand: (edit: Pick<InsertionEdit, 'blockKey' | 'offset' | 'style' | 'disableUndo'>, collapsedText: string) => InsertionEdit[];
}

export const TRIGGER_CHARACTERS = ['`', '*'];

export const styles: { [K in CoreInlineStyleName]: ExpandableInlineStyleDefinition } = {
  'core.styling.inlineCode': {
    name: 'core.styling.inlineCode',
    pattern: '`',
    allowsNesting: false,
    collapse: (edit, expandedText) => [{
      ...edit,
      type: 'insertion',
      deletionLength: 1,
      text: ''
    }, {
      ...edit,
      type: 'insertion',
      offset: edit.offset + expandedText.length - 1,
      deletionLength: 1,
      text: ''
    }],
    expand: (edit, collapsedText) => [{
      ...edit,
      type: 'insertion',
      text: '`'
    }, {
      ...edit,
      type: 'insertion',
      offset: edit.offset + collapsedText.length,
      text: '`'
    }],
    applyStyle: (contentState, blockOrKey, start, end) => {
      const blockKey = typeof blockOrKey === 'string' ? blockOrKey : blockOrKey.getKey();
      const styleSelection = createSelectionWithRange(
        contentState.getBlockForKey(blockKey),
        start,
        end
      );

      return Modifier.applyInlineStyle(contentState, styleSelection, 'core.styling.inlineCode');
    },
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
    collapse: (edit, expandedText) => [{
      ...edit,
      type: 'insertion',
      text: '',
      deletionLength: 2
    }, {
      ...edit,
      type: 'insertion',
      offset: edit.offset + expandedText.length - 2,
      text: '',
      deletionLength: 2
    }],
    expand: (edit, collapsedText) => [{
      ...edit,
      type: 'insertion',
      text: '**',
    }, {
      ...edit,
      type: 'insertion',
      offset: edit.offset + collapsedText.length,
      text: '**'
    }],
    applyStyle: (contentState, blockOrKey, start, end) => {
      const blockKey = typeof blockOrKey === 'string' ? blockOrKey : blockOrKey.getKey();
      const styleSelection = createSelectionWithRange(
        contentState.getBlockForKey(blockKey),
        start,
        end
      );

      return Modifier.applyInlineStyle(contentState, styleSelection, 'core.styling.bold');
    },
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
