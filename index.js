require('dotenv').config();
const { ethers } =  require('ethers');
const axios = require('axios');
const { AlphaRouter, SwapType } = require('@uniswap/smart-order-router');
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core');
const { getUniswapTrades, config } = require('./uniswapData');
const { getSushiswapTrades, config2 } = require('./sushiswapData');
// console.log(ethers)

const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const UNISWAP_ROUTER_ADDRESS = process.env.UNISWAP_ROUTER_ADDRESS;
const SUSHISWAP_ROUTER_ADDRESS = process.env.SUSHISWAP_ROUTER_ADDRESS;

const provider = new ethers.getDefaultProvider(RPC_ENDPOINT);
// console.log(provider)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// console.log(wallet)
const router = new AlphaRouter({ chainId: 11155111, wallet });

async function executeUniswapTrade(_wethAddress, tokenAddress, amountIn) {
  const wethAddress = _wethAddress;
  const token = new Token(1, tokenAddress, 18); // 1 is the chainId for Ethereum mainnet

  const amountInCurrency = CurrencyAmount.fromRawAmount(token, ethers.parseEther(amountIn.toString()).toString());
  const route = await router.route(
    amountInCurrency,
    token,
    TradeType.EXACT_INPUT,
    {
      recipient: wallet.address,
      slippageTolerance: new Percent(50, 10000), // 0.50%
      deadline: Math.floor(Date.now() / 1000) + 60 * 20
    },
    {
      value: ethers.parseEther(amountIn.toString())
    }
  );

  const transaction = {
    data: route.methodParameters.calldata,
    to: UNISWAP_ROUTER_ADDRESS,
    value: route.methodParameters.value,
    from: wallet.address,
    gasPrice: ethers.utils.parseUnits('20', 'gwei'),
    gasLimit: ethers.utils.hexlify(1000000)
  };

  const txResponse = await wallet.sendTransaction(transaction);
  await txResponse.wait();

  console.log('Uniswap trade executed:', txResponse.hash);
}

async function executeSushiswapTrade(tokenAddress, amountIn) {
  console.log('Sushiswap trade executed');
}

async function checkArbitrageOpportunity() {
  const uniswapTrades = await getUniswapTrades(config);
  // console.log(uniswapTrades[0].Trade)
  const sushiswapTrades = await getSushiswapTrades(config2);

  for (let index in sushiswapTrades) {
    // console.log(trade.Trade.Buy.PriceInUSD)
    let priceOnUniswap = uniswapTrades[index].Trade.Buy.PriceInUSD;
    let priceOnSushiswap = sushiswapTrades[index].Trade.Buy.PriceInUSD;

    // console.log(uniswapTrades[index].Trade.Buy.Currency)

    if (priceOnUniswap != priceOnSushiswap) { // Arbitrage condition, can be adjusted
      // console.log(priceOnSushiswap, priceOnUniswap)
      const token0Address = uniswapTrades[index].Trade.Buy.Currency.SmartContract;
      const token1Address = uniswapTrades[index].Trade.Sell.Currency.SmartContract;
      const amountIn = 1; // Amount in ETH, can be adjusted

      // Execute trade on Uniswap
      await executeUniswapTrade(token0Address, token1Address, amountIn);

      // Check balance of the token after Uniswap trade
      const tokenContract = new ethers.Contract(tokenAddress, ['function balanceOf(address owner) view returns (uint256)'], provider);
      const tokenBalance = await tokenContract.balanceOf(wallet.address);

      // Execute trade on Sushiswap
      await executeSushiswapTrade(tokenAddress, ethers.utils.formatUnits(tokenBalance, 18));

      console.log('Arbitrage opportunity executed.');
    }
  }
}

// Run the bot
checkArbitrageOpportunity() // Check every 5 seconds
