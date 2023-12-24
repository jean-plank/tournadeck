/// <reference path="../pb_data/types.d.ts" />

onRecordBeforeAuthWithOAuth2Request(e => {
  const collection = $app.dao().findCollectionByNameOrId('users')

  if (e.record === null) {
    e.record = new Record(collection, {
      ...e.oAuth2User,
      role: 'attendee',
    })
    e.record.refreshTokenKey()
  }

  e.record.set('displayName', e.oAuth2User.rawUser.global_name)

  $app.dao().saveRecord(e.record)
}, 'users')
