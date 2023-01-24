import { TypeormDatabase } from "@subsquid/typeorm-store"
import { SubstrateProcessor } from '@subsquid/substrate-processor'
import * as modules from './mappings'
import config from './config'
import { DEFAULT_BATCH_SIZE, DEFAULT_PORT } from './common/consts'

const database = new TypeormDatabase()
const processor = new SubstrateProcessor(database)

processor.setTypesBundle(config.typesBundle)
// processor.setBatchSize(config.batchSize || DEFAULT_BATCH_SIZE)
processor.setDataSource(config.dataSource)
processor.setPrometheusPort(config.port || DEFAULT_PORT)
processor.setBlockRange(config.blockRange || { from: 0 })

//events handlers
processor.addEventHandler('Staking.Rewarded', modules.staking.events.handleRewarded)
processor.addEventHandler('Staking.Reward', modules.staking.events.handleReward) // Old name of Rewarded event
processor.addEventHandler('Staking.Slashed', modules.staking.events.handleSlashed)
processor.addEventHandler('Staking.Slash', modules.staking.events.handleSlash) // Old name of Slashed event


processor.addCallHandler(
  'Balances.transfer',
  { triggerForFailedCalls: true },
  modules.balances.extrinsics.handleTransfer
)
processor.addCallHandler(
  'Balances.transfer_keep_alive',
  { triggerForFailedCalls: true },
  modules.balances.extrinsics.handleTransferKeepAlive
)
processor.addCallHandler('Staking.bond', modules.staking.extrinsics.handleBond)
processor.addCallHandler('Staking.unbond', modules.staking.extrinsics.handleUnbond)

processor.run()
