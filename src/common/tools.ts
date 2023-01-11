import * as ss58 from '@subsquid/ss58'
import config from '../config'
import { decodeHex } from '@subsquid/util-internal-hex'
import { CommonHandlerContext } from '@subsquid/substrate-processor'

const ss58codec = ss58.codec(config.prefix)

export function encodeId(id: Uint8Array) {
    return ss58codec.encode(typeof id === 'string' ? decodeHex(id) : id)
}

export function decodeId(id: string) {
    return ss58codec.decode(id)
}

export function isAdressSS58(address: Uint8Array) {
    switch (address.length) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 32:
        case 33:
            return true
        default:
            return false
    }
}

export function getOriginAccountId(origin: any): string | undefined {
    if (origin && origin.__kind === 'system' && origin.value.__kind === 'Signed') {
        const id = origin.value.value
        if (id.__kind === 'Id') {
            return encodeId(id.value)
        } else {
            return encodeId(id)
        }
    } else {
        return undefined
    }
}

export function saturatingSumBigInt(
    a: bigint,
    b: bigint,
    { max, min }: { max: null | bigint; min: bigint } = { max: null, min: 0n }
): bigint {
    const sum = BigInt(a) + BigInt(b)
    if (sum < min) {
        return min
    } else if (max && sum > max) {
        return max
    } else {
        return sum
    }
}

export function isStorageCorrupted(ctx: CommonHandlerContext<unknown>) {
    return ctx.block.height >= 1375087 && ctx.block.height <= 1600000
}
