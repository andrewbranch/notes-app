import { Styleable } from './types';

export function cn<T extends Styleable>(props: T, className: string): T {
  return Object.assign({}, props, { className: [className, props.className].join(' ') });
}