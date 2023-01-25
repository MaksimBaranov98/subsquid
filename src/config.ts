import { ProcessorConfig } from './types/custom/processorConfig'

const config: ProcessorConfig = {
    chainName: 'polkadot',
    prefix: 'polkadot',
    dataSource: {
        archive: 'https://polkadot.archive.subsquid.io/graphql',
        chain: 'wss://rpc.polkadot.io',
    },
    typesBundle: 'polkadot',
    batchSize: 100,
    // blockRange: {
    //     from: 7567700,
    // },
}

export default config
