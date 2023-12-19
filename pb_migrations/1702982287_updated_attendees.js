/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2hi5rjg4c65upks")

  // remove
  collection.schema.removeField("wk8seepd")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "uod1z4wv",
    "name": "currentElo",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "iron",
        "bronze",
        "silver",
        "gold",
        "platinum",
        "emerald",
        "diamond",
        "master",
        "grandmaster",
        "challenger"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2hi5rjg4c65upks")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wk8seepd",
    "name": "currentElo",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // remove
  collection.schema.removeField("uod1z4wv")

  return dao.saveCollection(collection)
})
