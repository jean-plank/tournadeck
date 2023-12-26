/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1sm1qeyu7mzdkdc")

  // remove
  collection.schema.removeField("mulebzrn")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bppc9q3a",
    "name": "seed",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1sm1qeyu7mzdkdc")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mulebzrn",
    "name": "seed",
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
  collection.schema.removeField("bppc9q3a")

  return dao.saveCollection(collection)
})
