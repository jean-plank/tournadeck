export const getImageUrl = (name: string, collectionName: string, recordId: string): string =>
  `${process.env.NEXT_PUBLIC_POCKET_BASE_URL}/api/files/${collectionName}/${recordId}/${name}`
