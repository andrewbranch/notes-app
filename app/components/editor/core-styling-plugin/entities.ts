import { ContentState } from 'draft-js';

export const TRIGGER_CHARACTERS = ['`'];

export const stylingEntities = [{
  name: 'inlineCode',
  rawPattern: /`([^`]+)`/g,
  format: (matchArray: RegExpMatchArray) => matchArray[1],
  createEntity: (currentContent: ContentState) => currentContent.createEntity(
    'core.styling.inlineCode',
    'MUTABLE'
  )
}];