import * as React from 'react';
import * as classNames from 'classnames/bind';
import { uniqueId, noop } from 'lodash';
import { Styleable, Styles } from './types';
import { cn } from './utils';
const styles: Styles = require('./MasterDetailView.scss');
const cx = classNames.bind(styles);

type TabProps = Pick<React.HTMLAttributes<HTMLElement>, 'role' | 'tabIndex'> & { 'aria-controls': string };
type TabPanelProps = Pick<React.HTMLAttributes<HTMLElement>, 'role' | 'id'>

export interface MasterDetailViewProps extends Styleable {
  masterListItems: string[];
  selectedMasterListItem: string | null;
  renderMasterListItem: (props: TabProps, listItem: string, isSelected: boolean, index: number) => JSX.Element;
  renderDetailView: (props: TabPanelProps) => JSX.Element;
  onUpArrow: React.KeyboardEventHandler<HTMLElement>;
  onDownArrow: React.KeyboardEventHandler<HTMLElement>;
  onUnhandledMasterViewKeyDown?: React.KeyboardEventHandler<HTMLElement>;
  highlightOnFocus?: boolean;
}

export class MasterDetailView extends React.Component<MasterDetailViewProps> {
  static DetailView: React.SFC<React.HTMLAttributes<HTMLDivElement>> = props => <div {...cn(props, styles.detail)} />;
  private detailViewId = uniqueId('detail-view-');
  static defaultProps = { onUnhandledMasterViewKeyDown: noop };

  private onKeyDown: React.KeyboardEventHandler<HTMLElement> = event => {
    switch (event.key) {
      case 'ArrowUp': return this.props.onUpArrow(event);
      case 'ArrowDown': return this.props.onDownArrow(event);
      default: this.props.onUnhandledMasterViewKeyDown!(event);
    }
  }

  render() {
    const {
      className,
      selectedMasterListItem,
      masterListItems,
      renderMasterListItem,
      renderDetailView,
      highlightOnFocus
    } = cn(this.props, styles.masterDetailView);

    return (
      <div className={className}>
        <div className={cx(styles.master, { highlightOnFocus })} onKeyDown={this.onKeyDown} role="tablist" tabIndex={0}>
          {masterListItems.map((key, index) => renderMasterListItem({ role: 'tab', tabIndex: -1, 'aria-controls': `${this.detailViewId}-${key}` }, key, selectedMasterListItem === key, index))}
        </div>
        {renderDetailView({ role: 'tabpanel', id: `${this.detailViewId}-${selectedMasterListItem}` })}
      </div>
    )
  }
}

MasterDetailView.DetailView.displayName = 'MasterDetailView.DetailView';
