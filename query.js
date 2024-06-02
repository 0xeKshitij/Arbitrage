const axios = require("axios");
let query = JSON.stringify({
  "query":
    'subscription {\n  EVM(mempool: true, network: eth) {\n    uniswap: DEXTrades(\n      limit: {count: 10}\n      orderBy: {descending: Block_Time}\n      where: {Trade: {Dex: {OwnerAddress: {is: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"}}}}\n    ) {\n      Block {\n        Time\n      }\n      Transaction {\n        From\n        To\n        Hash\n        CostInUSD\n        Gas\n        GasPriceInUSD\n      }\n      Trade {\n        Buy {\n          Buyer\n          Currency {\n            Name\n            Symbol\n            SmartContract\n          }\n          Seller\n          AmountInUSD\n          PriceInUSD\n        }\n        Sell {\n          Buyer\n          Currency {\n            Name\n            SmartContract\n            Symbol\n          }\n          Seller\n          AmountInUSD\n          PriceInUSD\n        }\n        Dex {\n          OwnerAddress\n        }\n      }\n    }\n    sushiswap: DEXTrades(\n      limit: {count: 10}\n      orderBy: {descending: Block_Time}\n      where: {Trade: {Dex: {OwnerAddress: {is: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"}}}}\n    ) {\n      Block {\n        Time\n      }\n      Transaction {\n        From\n        To\n        Hash\n        CostInUSD\n        Gas\n        GasPriceInUSD\n      }\n      Trade {\n        Buy {\n          Buyer\n          Currency {\n            Name\n            Symbol\n            SmartContract\n          }\n          Seller\n          AmountInUSD\n          PriceInUSD\n        }\n        Sell {\n          Buyer\n          Currency {\n            Name\n            SmartContract\n            Symbol\n          }\n          Seller\n          AmountInUSD\n          PriceInUSD\n        }\n        Dex {\n          OwnerAddress\n        }\n      }\n    }\n  }\n}\n',
  variables: "{}",
});

const config = {
  method: "post",
  maxBodyLength: Infinity,
  url: "https://streaming.bitquery.io/graphql",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": "BQYLfsZZIjznPuzJlwumzT55BpWUyEiC",
    Authorization:
      "Bearer ory_at_SU8crKTY-pkxyJ_QxQVLYJSbUTkMDYcpStRhW4XmTvk.0UgfFHsJz2ljGfKpq4P1gzoTzPQ9IPH7A34ObEKwOdU",
  },
  data: query,
};

const getData = async () => {
  try {
    const response = await axios.request(config);
    let uniswapTransactions = response.data.data.EVM.uniswap;
    let sushiswapTransactions = response.data.data.EVM.sushiswap;

    for (let i in uniswapTransactions) {
      let amount = uniswapTransactions[i].Trade.Buy.AmountInUSD;
      if (amount >= 1000) {
        return uniswapTransactions[i];
      }
    }

    for (let i in sushiswapTransactions) {
      let amount = sushiswapTransactions[i].Trade.Buy.AmountInUSD;
      if (amount >= 1000) {
        return sushiswapTransactions[i];
      }
    }
  } catch (error) {
    console.error(error);
    return error;
  }
};

// getData(config).then(result => {
//   console.log(result);
// }).catch(error => {
//   console.error(error);
// })
module.exports = {getData, config}
