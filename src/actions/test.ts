import { cookies } from 'next/headers'

import { adminPocketBase } from '../context'
import { Permissions } from '../helpers/Permissions'
import { auth } from '../helpers/auth'
import type { Test, TestInput } from '../models/pocketBase/tables/Test'
import { immutableAssign } from '../utils/fpTsUtils'

// for GET actions
const cacheDuration = 5 // seconds

const listTestTag = 'test/list'

export const listTest = immutableAssign(
  async (): Promise<ReadonlyArray<Test>> => {
    // call cookies to switch to dynamic rendering
    cookies()

    const adminPb = await adminPocketBase

    return await adminPb.collection('test').getFullList<Test>({
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

  return await adminPb.collection('test').create(test)
}
