/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const collection = new Collection({
      id: 'ojs68ud346gi1hp',
      created: '2024-11-22 23:09:08.525Z',
      updated: '2024-11-22 23:09:08.525Z',
      name: 'rawGames',
      type: 'base',
      system: false,
      schema: [
        {
          system: false,
          id: 'lmhs4c12',
          name: 'gameId',
          type: 'number',
          required: false,
          presentable: false,
          unique: false,
          options: {
            min: null,
            max: null,
            noDecimal: false,
          },
        },
        {
          system: false,
          id: 'afqozchm',
          name: 'value',
          type: 'json',
          required: false,
          presentable: false,
          unique: false,
          options: {
            maxSize: 2000000,
          },
        },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_hRNDNu1` ON `rawGames` (`gameId`)'],
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
    const collection = dao.findCollectionByNameOrId('ojs68ud346gi1hp')

    return dao.deleteCollection(collection)
  },
)
