require('dotenv').config();
const { ethers } =  require('ethers');
const axios = require('axios');
const { AlphaRouter, SwapType } = require('@uniswap/smart-order-router');
const { Token, CurrencyAmount, TradeType } = require('@uniswap/sdk-core');
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

async function executeUniswapTrade(tokenAddress, amountIn) {
  const wethAddress = ethers.constants.AddressZero;
  const token = new Token(1, tokenAddress, 18); // 1 is the chainId for Ethereum mainnet

  const amountInCurrency = CurrencyAmount.fromRawAmount(token, ethers.utils.parseEther(amountIn.toString()).toString());
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
      value: ethers.utils.parseEther(amountIn.toString())
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
  const trades = await getUniswapTrades(config);

  for (let trade of trades) {
    let amount = parseFloat(trade.tradeAmount);

    if (amount >= 1000) { // Arbitrage condition, can be adjusted
      const tokenAddress = '0x...'; // Replace with the actual token address
      const amountIn = 1; // Amount in ETH, can be adjusted

      // Execute trade on Uniswap
      await executeUniswapTrade(tokenAddress, amountIn);

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
setInterval(checkArbitrageOpportunity, 5000) // Check every 5 seconds
