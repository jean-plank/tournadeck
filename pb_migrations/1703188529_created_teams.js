/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const collection = new Collection({
      id: 'yie2rdfx006a8xu',
      created: '2023-12-21 19:55:29.547Z',
      updated: '2023-12-21 19:55:29.547Z',
      name: 'teams',
      type: 'base',
      system: false,
      schema: [
        {
          system: false,
          id: '3h945wdg',
          name: 'tournament',
          type: 'relation',
          required: true,
          presentable: false,
          unique: false,
          options: {
            collectionId: '3pbep6z2nrnxa9k',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          system: false,
          id: 'vyhkzxtf',
          name: 'name',
          type: 'text',
          required: true,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            pattern: '',
          },
        },
        {
          system: false,
          id: '8fyf94gl',
          name: 'tag',
          type: 'text',
          required: true,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            pattern: '',
          },
        },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_CelcYWM` ON `teams` (\n  `tournament`,\n  `tag`\n)'],
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      options: {},
    })

    return Dao(db).saveCollection(collection)
  },
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('yie2rdfx006a8xu')

    return dao.deleteCollection(collection)
  },
)
