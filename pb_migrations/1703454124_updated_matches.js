/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3e0p8fs3vhixq4h")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qykeqguy",
    "name": "tournament",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "3pbep6z2nrnxa9k",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3e0p8fs3vhixq4h")

  // remove
  collection.schema.removeField("qykeqguy")

  return dao.saveCollection(collection)
})
