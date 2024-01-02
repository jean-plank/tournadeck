/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('1sm1qeyu7mzdkdc')

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'fk4lwoln',
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
      }),
    )

    return dao.saveCollection(collection)
  },
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('1sm1qeyu7mzdkdc')

    // remove
    collection.schema.removeField('fk4lwoln')

    return dao.saveCollection(collection)
  },
)
