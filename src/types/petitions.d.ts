type Petition = {
    petitionId: number,
    title: string,
    categoryId: number,
    creationDate: string,
    ownerId: number,
    ownerFirstName: string,
    ownerLastName: string,
    numberOfSupporters: number,
    supportingCost: number
}

type petitionReturn = {
    petitions: Petition[],
    count: number
}

type supportTierPost = {
    title: string,
    description: string
    cost: number
}

type supportTier = {
    supportTierId: number,
} & supportTierPost

type PetitionFull = {
    description: string,
    moneyRaised: number,
    supportTiers: supportTier[]
} & Petition

type category = {
    categoryId: number,
    name: string
}

type postSupport = {
    supportTierId: number,
    message: string
}

type supporter = {
    supportId: number,
    supporterId: number,
    supporterFirstName: string,
    supporterLastName: string,
    timestamp: string
} & postSupport

type petitionSearchQuery = {
    q?: string,
    ownerId?: number,
    supporterId?: number,
    categoryIds?: Array<number>,
    supportingCost?: number,
    sortBy?: string,
    startIndex: number,
    count?: number
}