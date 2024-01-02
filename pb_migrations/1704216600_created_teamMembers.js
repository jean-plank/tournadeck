/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const collection = new Collection({
      id: 'e2k3w2uoajpt8k8',
      created: '2024-01-02 17:30:00.385Z',
      updated: '2024-01-02 17:30:00.385Z',
      name: 'teamMembers',
      type: 'base',
      system: false,
      schema: [
        {
          system: false,
          id: 'nfhimm2p',
          name: 'team',
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
          id: 'zmvqfj4y',
          name: 'attendee',
          type: 'relation',
          required: false,
          presentable: false,
          unique: false,
          options: {
            collectionId: '1sm1qeyu7mzdkdc',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
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
    const collection = dao.findCollectionByNameOrId('e2k3w2uoajpt8k8')

    return dao.deleteCollection(collection)
  },
)
