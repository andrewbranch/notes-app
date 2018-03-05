import * as React from 'react';
import { ContentState, Modifier, ContentBlock } from 'draft-js';
import { createSelectionWithRange } from '../../../utils/draft-utils';
import { Styles } from '../../../ui/types';
const styleVariables: Styles = require('../../../styles/variables.scss');

export type CoreInlineStyleName = 'core.styling.inlineCode';

export interface InlineStyleDefinition {
  name: CoreInlineStyleName;
  pattern: RegExp;
  applyStyle: (contentState: ContentState, blockOrKey: ContentBlock | string, start: number, end: number) => ContentState;
  styleAttributes: React.CSSProperties;
}

export interface ExpandableInlineStyleDefinition extends InlineStyleDefinition {
  collapse: (matchArray: RegExpMatchArray) => string;
  expand: (collapsedText: string) => string;
}

export const TRIGGER_CHARACTERS = ['`'];

export const styles: ExpandableInlineStyleDefinition[] = [{
  name: 'core.styling.inlineCode',
  pattern: /`([^`]+)`/g,
  collapse: matchArray => matchArray[1],
  expand: collapsedText => `\`${collapsedText}\``,
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
}];