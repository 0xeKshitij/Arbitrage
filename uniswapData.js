require('dotenv').config();
const axios = require('axios');
let data = JSON.stringify({
   "query": "query UniswapTrades{\n  EVM(mempool: true) {\n    DEXTrades(\n      limitBy: {count: 10}\n      orderBy: {descending: Block_Time}\n      where: {Trade: {Dex: {OwnerAddress: {is: \"0x1F98431c8aD98523631AE4a59f267346ea31F984\"}}, Buy: {Currency: {SmartContract: {is: \"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\"}}}, Sell: {Currency: {SmartContract: {is: \"0xdac17f958d2ee523a2206206994597c13d831ec7\"}}}}}\n    ) {\n      Trade {\n        Buy {\n          AmountInUSD\n          Buyer\n          Currency {\n            Name\n            Symbol\n            SmartContract\n          }\n          PriceInUSD\n        }\n        Sell {\n          AmountInUSD\n          Buyer\n          Currency {\n            Name\n            Symbol\n            SmartContract\n          }\n        }\n      }\n      Block {\n        Time\n      }\n    }\n  }\n}\n",
   "variables": "{}"
});

let config = {
   method: 'post',
   maxBodyLength: Infinity,
   url: 'https://streaming.bitquery.io/graphql',
   headers: { 
      'Content-Type': 'application/json', 
      'X-API-KEY': 'BQYVRzw02D5V2rWpWFii1pEbgLWCdx1y', 
      'Authorization': process.env.BITQUERY_API_KEY
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

const getUniswapTrades = async (_config) => {
  const uniswapTradeData = await axios.request(_config)
//   console.log(uniswapTradeData.data.data.EVM.DEXTrades)
return uniswapTradeData.data.data.EVM.DEXTrades
}

// getUniswapTrades(config)

module.exports = {getUniswapTrades, config}