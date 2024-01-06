/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('3pbep6z2nrnxa9k')

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'tf4okov4',
        name: 'bannedChampions',
        type: 'json',
        required: false,
        presentable: false,
        unique: false,
        options: {
          maxSize: 2000000,
        },
      }),
    )

    return dao.saveCollection(collection)
  },
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('3pbep6z2nrnxa9k')

    // remove
    collection.schema.removeField('tf4okov4')

    return dao.saveCollection(collection)
  },
)
