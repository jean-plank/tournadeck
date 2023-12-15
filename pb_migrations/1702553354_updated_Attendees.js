/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2hi5rjg4c65upks")

  collection.name = "attendees"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2hi5rjg4c65upks")

  collection.name = "Attendees"

  return dao.saveCollection(collection)
})
