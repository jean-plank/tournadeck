/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('3pbep6z2nrnxa9k')

    collection.viewRule = ''

    return dao.saveCollection(collection)
  },
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('3pbep6z2nrnxa9k')

    collection.viewRule = null

    return dao.saveCollection(collection)
  },
)
