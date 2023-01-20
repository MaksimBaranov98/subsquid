import { UnknownVersionError } from '../../common/errors'
import { decodeId, encodeId } from '../../common/tools'
import { StakingBondedStorage } from '../../types/generated/storage'
import { BlockContext as StorageContext } from '../../types/generated/support'

async function getStorageData(
    ctx: StorageContext,
    accounts: Uint8Array[]
): Promise<(Uint8Array | undefined)[] | undefined> {
    const storage = new StakingBondedStorage(ctx)
    if (!storage.isExists) return undefined

    if (storage.isV1020) {
        return await storage.getManyAsV1020(accounts)
    } else {
        throw new UnknownVersionError(storage.constructor.name)
    }
}

export const bonded = {
    get: async (ctx: StorageContext, account: string) => {
        const u8 = decodeId(account)

        const data = await getStorageData(ctx, [u8])
        if (!data || !data[0]) return undefined

        return encodeId(data[0])
    },
    getMany: async (ctx: StorageContext, accounts: string[]) => {
        if (accounts.length === 0) return []

        const u8s = accounts.map((a) => decodeId(a))

        const data = await getStorageData(ctx, u8s)
        if (!data) return undefined

        return data.map((d) => (d ? encodeId(d) : undefined))
    },
}
