/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const collection = new Collection({
      id: '3pbep6z2nrnxa9k',
      created: '2023-12-21 18:50:16.847Z',
      updated: '2023-12-21 18:50:16.847Z',
      name: 'tournaments',
      type: 'base',
      system: false,
      schema: [
        {
          system: false,
          id: 'xd8v6xnr',
          name: 'phase',
          type: 'select',
          required: true,
          presentable: false,
          unique: false,
          options: {
            maxSelect: 1,
            values: ['created', 'teamDraft', 'matches', 'finished'],
          },
        },
        {
          system: false,
          id: 'jc5ciim4',
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
          id: 'edqm2zfy',
          name: 'start',
          type: 'date',
          required: true,
          presentable: false,
          unique: false,
          options: {
            min: '',
            max: '',
          },
        },
        {
          system: false,
          id: 'cmiefwru',
          name: 'end',
          type: 'date',
          required: true,
          presentable: false,
          unique: false,
          options: {
            min: '',
            max: '',
          },
        },
        {
          system: false,
          id: 'lklzr5jo',
          name: 'teamsCount',
          type: 'number',
          required: false,
          presentable: false,
          unique: false,
          options: {
            min: 0,
            max: null,
            noDecimal: true,
          },
        },
        {
          system: false,
          id: 'lwsfnk5a',
          name: 'isVisible',
          type: 'bool',
          required: false,
          presentable: false,
          unique: false,
          options: {},
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
    const collection = dao.findCollectionByNameOrId('3pbep6z2nrnxa9k')

    return dao.deleteCollection(collection)
  },
)
