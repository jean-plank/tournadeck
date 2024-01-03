/// <reference path="../pb_data/types.d.ts" />
migrate(
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('3e0p8fs3vhixq4h')

    // remove
    collection.schema.removeField('pmlkrrmf')

    // remove
    collection.schema.removeField('q74drpb9')

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'eyd9mp5w',
        name: 'round',
        type: 'json',
        required: true,
        presentable: false,
        unique: false,
        options: {
          maxSize: 2000000,
        },
      }),
    )

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'xmn1sdsy',
        name: 'bestOf',
        type: 'number',
        required: false,
        presentable: false,
        unique: false,
        options: {
          min: null,
          max: null,
          noDecimal: false,
        },
      }),
    )

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'iyp6d2rt',
        name: 'winner',
        type: 'relation',
        required: false,
        presentable: false,
        unique: false,
        options: {
          collectionId: 'yie2rdfx006a8xu',
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
      }),
    )

    return dao.saveCollection(collection)
  },
  db => {
    const dao = new Dao(db)
    const collection = dao.findCollectionByNameOrId('3e0p8fs3vhixq4h')

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'pmlkrrmf',
        name: 'team1ResultsFrom',
        type: 'json',
        required: false,
        presentable: false,
        unique: false,
        options: {
          maxSize: 2000000,
        },
      }),
    )

    // add
    collection.schema.addField(
      new SchemaField({
        system: false,
        id: 'q74drpb9',
        name: 'team2ResultsFrom',
        type: 'json',
        required: false,
        presentable: false,
        unique: false,
        options: {
          maxSize: 2000000,
        },
      }),
    )

    // remove
    collection.schema.removeField('eyd9mp5w')

    // remove
    collection.schema.removeField('xmn1sdsy')

    // remove
    collection.schema.removeField('iyp6d2rt')

    return dao.saveCollection(collection)
  },
)
