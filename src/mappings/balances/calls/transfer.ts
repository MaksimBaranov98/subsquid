import { UnknownVersionError } from '../../../common/errors'
import { encodeId, getOriginAccountId, isAdressSS58 } from '../../../common/tools'
import { BalancesTransferCall } from '../../../types/generated/calls'
import { CallContext, CallHandlerContext } from '../../types/contexts'
import { saveTransfer } from '../../util/entities'

interface EventData {
    to: Uint8Array
    amount: bigint
}

function getCallData(ctx: CallContext): EventData | undefined {
    const call = new BalancesTransferCall(ctx)
    if (call.isV1020) {
        return undefined
    } else if (call.isV1050) {
        const { dest, value } = call.asV1050

        return {
            to: dest as Uint8Array,
            amount: value,
        }
    } else if (call.isV2028) {
        const { dest, value } = call.asV2028

        return {
            to: dest.value as Uint8Array,
            amount: value,
        }
    } else if (call.isV9111) {
        const { dest, value } = call.asV9111

        return {
            to: dest.value as Uint8Array,
            amount: value,
        }
    } else {
        throw new UnknownVersionError(call.constructor.name)
    }
}

export async function handleTransfer(ctx: CallHandlerContext) {
    const data = getCallData(ctx)

    if (!data) return

    const accountId = getOriginAccountId(ctx.call.origin)

    if (!accountId) return

    await saveTransfer(ctx, {
        id: ctx.call.id,
        extrinsicHash: ctx.extrinsic.hash,
        timestamp: ctx.block.timestamp,
        blockNumber: ctx.block.height,
        fromId: accountId,
        toId: isAdressSS58(data.to) ? encodeId(data.to) : null,
        amount: data.amount,
        success: ctx.call.success,
        extrinsicIdx: ctx.extrinsic.id,
        fee: ctx.extrinsic.fee,
    })
}
