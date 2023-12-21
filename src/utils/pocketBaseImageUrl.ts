import type { TableName, Tables } from '../models/pocketBase/Tables'

export function getImageUrl<A extends TableName>(
  collectionName: A,
  recordId: Tables[A]['id'],
  name: string,
): string {
  return `${process.env.NEXT_PUBLIC_POCKET_BASE_URL}/api/files/${collectionName}/${recordId}/${name}`
}
