import { compose } from 'redux';
import { normalizeCoreStyles } from './coreStylingPlugin';
import { normalizeCoreBlocks } from './coreBlockPlugin';

export const normalizePlugins = compose(
  normalizeCoreBlocks,
  normalizeCoreStyles
);
