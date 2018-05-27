import { CoreExpandableEntityDefinition, EntityData } from './types';

export interface LinkData extends EntityData {
  text: string;
  href: string;
}

export type LinkEntityDefinition = CoreExpandableEntityDefinition<'link', LinkData>;

export const linkEntityDefinition: LinkEntityDefinition = {
  type: 'link',
  pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
  getData: match => ({ text: match[1], href: match[2] }),
  mutability: 'MUTABLE'
};
