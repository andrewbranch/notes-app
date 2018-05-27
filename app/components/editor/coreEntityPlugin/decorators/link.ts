import { Decorator } from 'draft-js-plugins-editor';
import { Link } from '../components/link';

export const linkDecorator: Decorator = {
  strategy: (block, callback, contentState) => {
    block.findEntityRanges(
      character => {
        const entityKey = character.getEntity();
        return !!entityKey && contentState.getEntity(entityKey).getType() === 'link';
      },
      callback
    );
  },
  component: Link
}