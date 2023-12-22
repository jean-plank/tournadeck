/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const collection = new Collection({
      id: '3e0p8fs3vhixq4h',
      created: '2023-12-21 19:58:21.083Z',
      updated: '2023-12-21 19:58:21.083Z',
      name: 'matches',
      type: 'base',
      system: false,
      schema: [
        {
          system: false,
          id: 'pmlkrrmf',
          name: 'team1ResultsFrom',
          type: 'json',
          required: false,
          presentable: false,
          unique: false,
          options: {
            maxSize: 2000000,
          },
        },
        {
          system: false,
          id: '96v4kxqv',
          name: 'team1',
          type: 'relation',
          required: false,
          presentable: false,
          unique: false,
          options: {
            collectionId: 'yie2rdfx006a8xu',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          system: false,
          id: 'q74drpb9',
          name: 'team2ResultsFrom',
          type: 'json',
          required: false,
          presentable: false,
          unique: false,
          options: {
            maxSize: 2000000,
          },
        },
        {
          system: false,
          id: 't4poiqlm',
          name: 'team2',
          type: 'relation',
          required: false,
          presentable: false,
          unique: false,
          options: {
            collectionId: 'yie2rdfx006a8xu',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          system: false,
          id: 'mfo9nq65',
          name: 'plannedOn',
          type: 'date',
          required: false,
          presentable: false,
          unique: false,
          options: {
            min: '',
            max: '',
          },
        },
        {
          system: false,
          id: 'kyphhvuv',
          name: 'apiData',
          type: 'json',
          required: false,
          presentable: false,
          unique: false,
          options: {
            maxSize: 2000000,
          },
        },
      ],
      indexes: [],
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
    const collection = dao.findCollectionByNameOrId('3e0p8fs3vhixq4h')

    return dao.deleteCollection(collection)
  },
)
