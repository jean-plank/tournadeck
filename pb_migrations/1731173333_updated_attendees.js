/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('1sm1qeyu7mzdkdc')

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'iwdqyhkg',
        name: 'avatarRating',
        type: 'number',
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          noDecimal: false,
        },
      }),
    )

    return dao.saveCollection(collection)
  },
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('1sm1qeyu7mzdkdc')

    // remove
    collection.schema.removeField('iwdqyhkg')

    return dao.saveCollection(collection)
  },
)
