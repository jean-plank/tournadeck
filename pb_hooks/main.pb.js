/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  'DELETE',
  '/truncate/:nameOrId',
  c => {
    const collection = $app.dao().findCollectionByNameOrId(c.pathParam('nameOrId'))

    $app.dao().db().newQuery(`DELETE FROM ${collection.name}`).execute()

    c.noContent(204)
  },
  $apis.activityLogger($app),
  $apis.requireAdminAuth(),
)
