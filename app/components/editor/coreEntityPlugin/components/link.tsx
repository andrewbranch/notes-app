import * as React from 'react';
import { LinkData } from '../entities/link';
import { DraftDecoratorComponentProps } from 'draft-js-plugins-editor';
import { openExternalOnCmdModifier } from '../../../../utils/openExternal';

export const Link: React.SFC<DraftDecoratorComponentProps> = ({ children, contentState, entityKey }) => {
  const { href }: LinkData = contentState.getEntity(entityKey).getData();
  return <a href={href} onClick={openExternalOnCmdModifier}>{children}</a>;
};
