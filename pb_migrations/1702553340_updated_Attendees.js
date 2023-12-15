/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2hi5rjg4c65upks")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "n5aza1ri",
    "name": "tournament",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "alrw6wcgtl57oxy",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2hi5rjg4c65upks")

  // remove
  collection.schema.removeField("n5aza1ri")

  return dao.saveCollection(collection)
})
