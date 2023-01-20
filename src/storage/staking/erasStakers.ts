import { UnknownVersionError } from '../../common/errors'
import { decodeId, encodeId } from '../../common/tools'
import { StakingErasStakersStorage, StakingStakersStorage } from '../../types/generated/storage'
import { BlockContext as StorageContext } from '../../types/generated/support'

interface StorageData {
    total: bigint
    own: bigint
    others: { who: Uint8Array; value: bigint }[]
}

async function getStakersData(ctx: StorageContext, keys: Uint8Array[]): Promise<StorageData[] | undefined> {
    const storage = new StakingStakersStorage(ctx)
    if (!storage.isExists) return undefined

    if (storage.isV1020) {
        return await storage.getManyAsV1020(keys)
    } else {
        throw new UnknownVersionError(storage.constructor.name)
    }
}

async function getErasStakersData(
    ctx: StorageContext,
    keys: [era: number, account: Uint8Array][]
): Promise<StorageData[] | undefined> {
    const storage = new StakingErasStakersStorage(ctx)
    if (!storage.isExists) return undefined

    if (storage.isV1050) {
        return await storage.getManyAsV1050(keys)
    } else {
        throw new UnknownVersionError(storage.constructor.name)
    }
}

interface EraStaker {
    total: bigint
    own: bigint
    nominators: { id: string; vote: bigint }[]
}

type ErasStakersArgs = [account: string, era?: number]

async function queryStorageFunction(
    ctx: StorageContext,
    keys: ErasStakersArgs[]
): Promise<(EraStaker | undefined)[] | undefined> {
    if (keys.length === 0) return []

    const eraStakers: [number, Uint8Array][] = keys.map((k) => [k[1] || 0, decodeId(k[0])])
    const stakers: Uint8Array[] = keys.map((k) => decodeId(k[0]))

    const data = (await getErasStakersData(ctx, eraStakers)) || (await getStakersData(ctx, stakers))
    if (!data) return undefined

    return data.map((v) => ({
        total: v.total,
        own: v.own,
        nominators: v.others.map((n) => ({
            id: encodeId(n.who),
            vote: n.value,
        })),
    }))
}

export async function getEraStakersData(ctx: StorageContext, ...args: ErasStakersArgs): Promise<EraStaker | undefined>
export async function getEraStakersData(
    ctx: StorageContext,
    keys: ErasStakersArgs[]
): Promise<(EraStaker | undefined)[] | undefined>
export async function getEraStakersData(ctx: StorageContext, keys: ErasStakersArgs[] | string, era?: number) {
    if (typeof keys === 'string') {
        return (await queryStorageFunction(ctx, [[keys, era]]))?.[0]
    } else {
        return await queryStorageFunction(ctx, keys)
    }
}
