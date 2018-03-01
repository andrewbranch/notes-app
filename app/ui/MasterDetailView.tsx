import * as React from 'react';
import { Styleable, Styles } from './types';
import { cn } from './utils';
const styles: Styles = require('./MasterDetailView.scss');
console.log(styles);

export interface MasterDetailViewProps extends Styleable {
  masterListItems: string[];
  selectedMasterListItem: string;
  renderMasterListItem: (listItem: string, isSelected: boolean, index: number) => JSX.Element;
  detailView: JSX.Element;
}

export class MasterDetailView extends React.Component<MasterDetailViewProps> {
  static DetailView: React.SFC<React.HTMLAttributes<HTMLDivElement>> = props => <div {...cn(props, styles.detailView)} />;

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
        <div className={styles.detail}>
          {detailView}
        </div>
      </div>
    )
  }
}

MasterDetailView.DetailView.displayName = 'MasterDetailView.DetailView';
