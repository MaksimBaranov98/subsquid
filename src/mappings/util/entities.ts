import {
    Transfer,
    HistoryElement
} from '../../model'
import { CommonHandlerContext } from '../types/contexts'

export interface TransferData {
    id: string,
    fromId: string
    toId: string | null
    amount: bigint
    success: boolean
    fee?: bigint
    eventIdx: number
    timestamp: number
    extrinsicHash: string
    extrinsicIdx: string
    blockNumber: number
}

export async function saveTransfer(ctx: CommonHandlerContext, data: TransferData) {
    const { fromId, toId, amount, success, fee, eventIdx, id, timestamp, extrinsicHash, extrinsicIdx, blockNumber } = data

    const transfer = new Transfer({
        from: fromId,
        to: toId ?? '',
        success,
        amount: amount.toString(),
        eventIdx,
        fee
    })

    const historyElementFrom = new HistoryElement({
        id: `${id}-from`,
        address: fromId,
        timestamp: BigInt(timestamp),
        blockNumber,
        extrinsicIdx,
        extrinsicHash,
        transfer,
        extrinsic: null,
        reward: null,
    })

    await ctx.store.insert(historyElementFrom)

    if (toId) {
        const historyElementTo = new HistoryElement({
            id: `${id}-to`,
            address: toId,
            timestamp: BigInt(timestamp),
            blockNumber,
            extrinsicIdx,
            extrinsicHash,
            transfer,
            extrinsic: null,
            reward: null,
        })

        await ctx.store.insert(historyElementTo)
    }
}
