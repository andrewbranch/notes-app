import * as React from 'react';
import { Styleable, Styles } from './types';
import { cn } from './utils';
const styles: Styles = require('./MasterDetailView.scss');

export interface MasterDetailViewProps extends Styleable {
  masterListItems: string[];
  selectedMasterListItem: string;
  renderMasterListItem: (listItem: string, isSelected: boolean, index: number) => JSX.Element;
  detailView: JSX.Element;
}

export class MasterDetailView extends React.Component<MasterDetailViewProps> {
  static DetailView: React.SFC<React.HTMLAttributes<HTMLDivElement>> = props => <div {...cn(props, styles.detail)} />;

  render() {
    const {
      className,
      selectedMasterListItem,
      masterListItems,
      renderMasterListItem,
      detailView
    } = cn(this.props, styles.masterDetailView);

    return (
      <div className={className}>
        <div className={styles.master}>
          {masterListItems.map((key, index) => renderMasterListItem(key, selectedMasterListItem === key, index))}
        </div>
        {detailView}
      </div>
    )
  }
}

MasterDetailView.DetailView.displayName = 'MasterDetailView.DetailView';
