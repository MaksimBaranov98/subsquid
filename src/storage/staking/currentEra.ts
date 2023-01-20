import { UnknownVersionError } from '../../common/errors'
import { StakingCurrentEraStorage } from '../../types/generated/storage'
import { BlockContext as StorageContext } from '../../types/generated/support'

interface StorageData {
    index: number | undefined
}

async function getStorageData(ctx: StorageContext): Promise<StorageData | undefined> {
    const storage = new StakingCurrentEraStorage(ctx)
    if (!storage.isExists) return undefined

    if (storage.isV1020) {
        return { index: await storage.getAsV1020() }
    } else if (storage.isV1050) {
        return { index: await storage.getAsV1050() }
    } else {
        throw new UnknownVersionError(storage.constructor.name)
    }
}

const storageCache: {
    hash?: string
    value?: CurrentEra
} = {}

interface CurrentEra {
    index: number | undefined
}

export async function getCurrentEra(ctx: StorageContext): Promise<CurrentEra | undefined> {
    if (storageCache.hash !== ctx.block.hash) {
        storageCache.hash = ctx.block.hash
        delete storageCache.value
    }

    if (!storageCache.value) {
        storageCache.value = await getStorageData(ctx)
    }

    return storageCache.value
}
