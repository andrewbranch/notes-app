import * as RxDB from 'rxdb';

// TODO: post on https://github.com/facebook/draft-js/issues/1544 when complete
export const noteSchema: RxDB.RxJsonSchema = {
  version: 0,
  title: 'notes schema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    content: {
      type: 'object',
      properties: {
        blocks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: {
                type: 'string'
              },
              text: {
                type: 'string'
              },
              type: {
                type: 'string'
              },
              depth: {
                type: 'integer'
              },
              inlineStyleRanges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    offset: {
                      type: 'integer'
                    },
                    length: {
                      type: 'integer'
                    },
                    style: {
                      type: 'string'
                    }
                  },
                  required: [
                    'length',
                    'offset',
                    'style'
                  ],
                }
              },
              entityRanges: {
                type: 'array',
                items: {}
              },
              data: {
                type: 'object'
              }
            }
          }
        },
        entityMap: {
          type: 'object'
        }
      }
    }
  },
  required: ['content']
};