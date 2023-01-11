import {lookupArchive} from "@subsquid/archive-registry"
import * as ss58 from "@subsquid/ss58"
import { TypeormDatabase } from "@subsquid/typeorm-store"
import { SubstrateProcessor } from '@subsquid/substrate-processor'
import * as modules from './mappings'

const database = new TypeormDatabase()
const processor = new SubstrateProcessor(database)

processor.addCallHandler(
    'Balances.transfer',
    { triggerForFailedCalls: true },
    modules.balances.extrinsics.handleTransfer
)

processor.run()
