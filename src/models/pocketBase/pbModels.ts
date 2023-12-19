export type PbBaseModel = {
  id: string
  collectionId: string
  collectionName: string
  created: string
  updated: string
}

export type PbAuthModel = PbBaseModel & {
  username: string
  verified: boolean
  emailVisibility: boolean
  email: string
}
