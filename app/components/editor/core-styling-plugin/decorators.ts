import { Decorator } from 'draft-js-plugins-editor';
import { createDecoratorStrategyMatchingEntityType } from '../../../utils/draft-utils';
import { Code } from './components/Code';

export const decorators: Decorator[] = [{
  strategy: createDecoratorStrategyMatchingEntityType('core.styling.inlineCode'),
  component: Code
}];
