import { BalancesForceTransferCall } from '../../../types/generated/calls'
import { encodeId, isAdressSS58 } from '../../../common/tools'
import { UnknownVersionError } from '../../../common/errors'
import { CallContext, CallHandlerContext } from '../../types/contexts'
import { saveTransfer } from '../../util/entities'

interface EventData {
    from: Uint8Array
    to: Uint8Array
    amount: bigint
}

function getCallData(ctx: CallContext): EventData | undefined {
    const call = new BalancesForceTransferCall(ctx)
    if (call.isV1020) {
        return undefined
    } else if (call.isV1050) {
        const { source, dest, value } = call.asV1050
        return {
            from: source as Uint8Array,
            to: dest as Uint8Array,
            amount: value,
        }
    } else if (call.isV2028) {
        const { source, dest, value } = call.asV2028
        return {
            from: source.value as Uint8Array,
            to: dest.value as Uint8Array,
            amount: value,
        }
    } else if (call.isV9111) {
        const { source, dest, value } = call.asV9111
        return {
            from: source.value as Uint8Array,
            to: dest.value as Uint8Array,
            amount: value,
        }
    } else {
        throw new UnknownVersionError(call.constructor.name)
    }
}

export async function handleForceTransfer(ctx: CallHandlerContext) {
    const data = getCallData(ctx)
    if (!data) return

    // await saveTransfer(ctx, {
    //     fromId: encodeId(data.from),
    //     toId: isAdressSS58(data.to) ? encodeId(data.to) : null,
    //     amount: data.amount,
    //     success: ctx.call.success,
    // })
}
