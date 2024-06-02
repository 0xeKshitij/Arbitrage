const { getData, config } = require('./query');

const executeArbitrage = async () => {
    const result = await getData(config)
    if(result.Trade.Dex.OwnerAddress == "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"){
        executeUniswapTrade(result)
    }else if(result.Trade.Dex.OwnerAddress == "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"){
        executeSushiswapTrade(result)
    }
}

const executeUniswapTrade = async (result) => {
    console.log(result.Trade)
}

const executeSushiswapTrade = async () => {}

executeArbitrage()