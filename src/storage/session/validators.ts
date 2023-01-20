import { UnknownVersionError } from '../../common/errors'
import { encodeId } from '../../common/tools'
import { SessionValidatorsStorage } from '../../types/generated/storage'
import { BlockContext as StorageContext } from '../../types/generated/support'

type StorageData = Uint8Array[]

async function getStorageData(ctx: StorageContext): Promise<StorageData | undefined> {
    const storage = new SessionValidatorsStorage(ctx)
    if (!storage.isExists) return undefined

    if (storage.isV1020) {
        return await storage.getAsV1020()
    } else {
        throw new UnknownVersionError(storage.constructor.name)
    }
}

const storageCache: {
    hash?: string
    value?: Validators
} = {}

type Validators = string[]

export async function getValidators(ctx: StorageContext): Promise<Validators | undefined> {
    if (storageCache.hash !== ctx.block.hash) {
        storageCache.hash = ctx.block.hash
        delete storageCache.value
    }

    if (!storageCache.value) {
        const data = await getStorageData(ctx)
        if (!data) return undefined

        storageCache.value = data.map((id) => encodeId(id))
    }

    return storageCache.value
}
