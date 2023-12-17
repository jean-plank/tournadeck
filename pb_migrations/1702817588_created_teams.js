/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "3lynsidzcvruc7g",
    "created": "2023-12-17 12:53:08.897Z",
    "updated": "2023-12-17 12:53:08.897Z",
    "name": "teams",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "wskzwnr7",
        "name": "tournament",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "alrw6wcgtl57oxy",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "guiynswo",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("3lynsidzcvruc7g");

  return dao.deleteCollection(collection);
})
