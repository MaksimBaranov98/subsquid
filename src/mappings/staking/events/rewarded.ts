import { UnknownVersionError } from '../../../common/errors'
import { encodeId } from '../../../common/tools'
import { StakingRewardedEvent, StakingRewardEvent } from '../../../types/generated/events'
import { EventContext, EventHandlerContext } from '../../types/contexts'
import { ActionData } from '../../types/data'
import {
  HistoryElement,
  Reward,
} from '../../../model'
import { ERA_MS, FIRST_BLOCK_TIMESTAMP } from '../../util/consts'

interface EventData {
  amount: bigint
  account: Uint8Array
}

function getRewardedEventData(ctx: EventContext): EventData | undefined {
  const event = new StakingRewardedEvent(ctx)

  if (event.isV9090) {
    const [account, amount] = event.asV9090

    return {
      account,
      amount,
    }
  }
  // else {
  //   throw new UnknownVersionError(event.constructor.name)
  // }
}

function getRewardEventData(ctx: EventHandlerContext): EventData | undefined {
  const event = new StakingRewardEvent(ctx)

  if (event.isV1020)
    return undefined
  else if (event.isV1050) {
    const [account, amount] = event.asV1050

    return {
      account,
      amount,
    }
  }
  // else {
  //   throw new UnknownVersionError(event.constructor.name)
  // }
}

export async function handleRewarded(ctx: EventHandlerContext, old = false) {
  const data = old ? getRewardEventData(ctx) : getRewardedEventData(ctx)

  if (!data) return

  await saveReward(ctx, {
    id: ctx.event.id,
    extrinsicHash: ctx.event.extrinsic?.hash,
    extrinsicIdx: ctx.event.extrinsic?.id,
    timestamp: ctx.block.timestamp,
    blockNumber: ctx.block.height,
    amount: data.amount,
    validator: ctx.block.validator,
    accountId: encodeId(data.account),
  })
}

export async function handleReward(ctx: EventHandlerContext) {
  return handleRewarded(ctx, true)
}

export interface RewardData extends ActionData {
  amount: bigint
  validator?: string
  accountId: string
}

export async function saveReward(ctx: EventHandlerContext, data: RewardData) {
  const { accountId, amount, id, timestamp, extrinsicHash, blockNumber, extrinsicIdx, validator } = data;
  const era = Math.ceil((timestamp - FIRST_BLOCK_TIMESTAMP) / ERA_MS);

  const reward = new Reward({
    amount: amount.toString(),
    isReward: true,
    era,
    eventIdx: id,
    stash: accountId,
    validator
  })

  const historyElement = new HistoryElement({
    id,
    address: accountId,
    timestamp: BigInt(timestamp),
    blockNumber,
    extrinsicIdx,
    extrinsicHash,
    transfer: null,
    extrinsic: null,
    reward,
  })

await ctx.store.insert(historyElement)
}
