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
> = CoreEntityDefinition<T, DataT> & {
  getCollapsedText: (data: DataT) => string;
  getExpandedText: (data: DataT) => string;
  adjustSelectionOnExpand: (offset: number, data: DataT) => number;
  updateDataOnCollapse?: (data: DataT) => Partial<DataT>;
  updateDataOnExpand?: (data: DataT) => Partial<DataT>;
};
