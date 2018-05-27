export type CoreExpandableEntityType = 'link';
export type CoreEntityType = CoreExpandableEntityType;

export interface EntityData {
  expanded?: boolean;
}

export type CoreEntityDefinition<T extends CoreEntityType, DataT extends EntityData> = {
  type: T;
  pattern: RegExp;
  getData: (match: RegExpExecArray) => DataT;
  mutability: 'MUTABLE' | 'IMMUTABLE' | 'SEGMENTED';
}

export type CoreExpandableEntityDefinition<
  T extends CoreExpandableEntityType,
  DataT extends EntityData = EntityData
> = CoreEntityDefinition<T, DataT>;
