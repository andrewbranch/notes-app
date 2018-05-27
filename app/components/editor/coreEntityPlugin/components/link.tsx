import * as React from 'react';
import { LinkData } from '../entities/link';
import { DraftDecoratorComponentProps } from 'draft-js-plugins-editor';

export const Link: React.SFC<DraftDecoratorComponentProps> = ({ children, contentState, entityKey }) => {
  const { href }: LinkData = contentState.getEntity(entityKey).getData();
  return <a href={href}>{children}</a>;
};
