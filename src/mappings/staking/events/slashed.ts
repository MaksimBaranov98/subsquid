import { UnknownVersionError } from '../../../common/errors'
import { encodeId, isStorageCorrupted } from '../../../common/tools'
import { StakingSlashedEvent, StakingSlashEvent } from '../../../types/generated/events'
import { EventContext, EventHandlerContext } from '../../types/contexts'
import { ActionData } from '../../types/data'
import {
  StakeChange,
} from '../../../model'
import { handleAccumulatedStake } from '../utils'

interface EventData {
  amount: bigint
  account: Uint8Array
}

function getSlashedEvent(ctx: EventContext): EventData {
  const event = new StakingSlashedEvent(ctx)

  if (event.isV9090) {
    const [account, amount] = event.asV9090

    return {
      account,
      amount,
    }
  } else if (event.isV9300) {
    const { staker: account, amount } = event.asV9300

    return {
      account,
      amount,
    }
  } else {
    throw new UnknownVersionError(event.constructor.name)
  }
}

function getSlashEvent(ctx: EventHandlerContext): EventData {
  const event = new StakingSlashEvent(ctx)

  if (event.isV1020) {
    const [account, amount] = event.asV1020
    return {
      account,
      amount,
    }
  } else {
    throw new UnknownVersionError(event.constructor.name)
  }
}

export async function handleSlashed(ctx: EventHandlerContext, old = false) {
  const data = old ? getSlashEvent(ctx) : getSlashedEvent(ctx)

  await saveSlash(ctx, {
    id: ctx.event.id,
    timestamp: ctx.block.timestamp,
    blockNumber: ctx.block.height,
    extrinsicHash: ctx.event.extrinsic?.hash,
    accountId: encodeId(data.account),
    amount: data.amount,
  })
}

export async function handleSlash(ctx: EventHandlerContext) {
  return handleSlashed(ctx, true)
}

export interface SlashData extends ActionData {
  amount: bigint
  accountId: string
}

export async function saveSlash(ctx: EventHandlerContext, data: SlashData) {
  const { accountId, amount, id, timestamp, extrinsicHash, blockNumber } = data;
  const accumulatedAmount = await handleAccumulatedStake(ctx, data);

  const stakeChange = new StakeChange({
    id,
    eventIdx: id,
    address: accountId,
    timestamp: BigInt(timestamp),
    blockNumber,
    extrinsicHash,
    amount,
    type: 'slashed',
    accumulatedAmount,
  })

  await ctx.store.insert(stakeChange)
}
