const axios = require('axios');
let data = JSON.stringify({
   "query": "query Sushiswap {\n  EVM(mempool: true) {\n    DEXTrades(\n      limitBy: {count: 10}\n      orderBy: {descending: Block_Time}\n      where: {Trade: {Dex: {OwnerAddress: {is: \"0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac\"}}, Buy: {Currency: {SmartContract: {is: \"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\"}}}, Sell: {Currency: {SmartContract: {is: \"0xdac17f958d2ee523a2206206994597c13d831ec7\"}}}}}\n    ) {\n      Block {\n        Time\n      }\n      Trade {\n        Buy {\n          AmountInUSD\n          Buyer\n          Currency {\n            Name\n            Symbol\n            SmartContract\n          }\n          PriceInUSD\n        }\n        Sell {\n          AmountInUSD\n          Buyer\n          Currency {\n            Name\n            Symbol\n            SmartContract\n          }\n        }\n      }\n    }\n  }\n}\n",
   "variables": "{}"
});

let config2 = {
   method: 'post',
   maxBodyLength: Infinity,
   url: 'https://streaming.bitquery.io/graphql',
   headers: { 
      'Content-Type': 'application/json', 
      'X-API-KEY': 'BQYVRzw02D5V2rWpWFii1pEbgLWCdx1y', 
      'Authorization': 'Bearer ory_at_SU8crKTY-pkxyJ_QxQVLYJSbUTkMDYcpStRhW4XmTvk.0UgfFHsJz2ljGfKpq4P1gzoTzPQ9IPH7A34ObEKwOdU'
   },
   data : data
};

// axios.request(config)
// .then((response) => {
//    console.log(JSON.stringify(response.data));
// })
// .catch((error) => {
//    console.log(error);
// });

const getSushiswapTrades = async (_config) => {
    const sushiswapTradeData = await axios.request(_config)
   //  console.log(sushiswapTradeData.data.data.EVM.DEXTrades)
    return sushiswapTradeData.data.data.EVM.DEXTrades
  }
  
// getSushiswapTrades(config)
  
module.exports = {getSushiswapTrades, config2}