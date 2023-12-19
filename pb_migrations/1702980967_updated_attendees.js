/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2hi5rjg4c65upks")

  // remove
  collection.schema.removeField("jousbman")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "j1j1q01a",
    "name": "role",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "adc",
        "jungle",
        "top",
        "mid",
        "support"
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
    "id": "jousbman",
    "name": "role",
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
  collection.schema.removeField("j1j1q01a")

  return dao.saveCollection(collection)
})
