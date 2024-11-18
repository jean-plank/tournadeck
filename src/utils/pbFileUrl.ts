import type { TableName, Tables } from '../models/pocketBase/Tables'

export function pbFileUrl<A extends TableName>(
  collectionName: A,
  recordId: Tables[A]['id']['output'],
  name: string,
  baseUrl = process.env['NEXT_PUBLIC_POCKET_BASE_URL'],
): string {
  return `${baseUrl}/api/files/${collectionName}/${recordId}/${name}`
}
