/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('eox1el5ztkpqk1x')

    return dao.deleteCollection(collection)
  },
  db => {
    const collection = new Collection({
      id: 'eox1el5ztkpqk1x',
      created: '2023-12-13 16:25:30.139Z',
      updated: '2023-12-13 16:25:30.139Z',
      name: 'test',
      type: 'base',
      system: false,
      schema: [
        {
          system: false,
          id: 'rglm1opr',
          name: 'label',
          type: 'text',
          required: false,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            pattern: '',
          },
        },
      ],
      indexes: [],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      options: {},
    })

    return Dao(db).saveCollection(collection)
  },
)
