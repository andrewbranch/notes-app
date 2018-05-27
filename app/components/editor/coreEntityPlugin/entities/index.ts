import { values } from 'lodash';
import { linkEntityDefinition } from './link';
import { CoreExpandableEntityType, CoreExpandableEntityDefinition } from './types';

export const expandableEntities: { [K in CoreExpandableEntityType]: CoreExpandableEntityDefinition<K> } = {
  link: linkEntityDefinition
};

export const expandableEntityKeys = Object.keys(expandableEntities);
export const expandableEntityValues = values(expandableEntities);
export const entities = expandableEntities;
export const entityKeys = expandableEntityKeys;
export const entityValues = expandableEntityValues;
export const isExpandableEntityKey = (type: string): type is CoreExpandableEntityType => type in expandableEntities;