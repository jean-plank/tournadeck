import { cookies } from 'next/headers'

import { Permissions } from '../../helpers/Permissions'
import { auth } from '../../helpers/auth'
import type { Test, TestInput } from '../../models/pocketBase/tables/Test'
import { adminPocketBase } from '../../services/adminPocketBase/adminPocketBase'
import { immutableAssign } from '../../utils/fpTsUtils'

// for GET actions
const cacheDuration = 5 // seconds

const listTestTag = 'test/list'

export const listTest = immutableAssign(
  async (): Promise<ReadonlyArray<Test>> => {
    // call cookies to switch to dynamic rendering
    cookies()

    const adminPb = await adminPocketBase

    return adminPb.collection('test').getFullList({
      next: {
        revalidate: cacheDuration,
        tags: [listTestTag],
      },
    })
  },
  { tag: listTestTag },
)

export async function createTest(test: TestInput): Promise<Test> {
  const { user } = await auth()

  if (!Permissions.test.create(user.role)) {
    throw Error('Forbidden')
  }

  const adminPb = await adminPocketBase

  return adminPb.collection('test').create(test)
}
