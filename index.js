require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const { AlphaRouter, SwapType } = require('@uniswap/smart-order-router');
const { Token, CurrencyAmount, TradeType } = require('@uniswap/sdk-core');
const { getMempoolData } = require('./mempoolQuery');

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const UNISWAP_ROUTER_ADDRESS = process.env.UNISWAP_ROUTER_ADDRESS;
const SUSHISWAP_ROUTER_ADDRESS = process.env.SUSHISWAP_ROUTER_ADDRESS;

const provider = new ethers.providers.InfuraProvider('mainnet', INFURA_PROJECT_ID);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const router = new AlphaRouter({ chainId: 1, provider });

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
  const sushiswapRouter = new ethers.Contract(
    SUSHISWAP_ROUTER_ADDRESS,
    ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
    wallet
  );

  const tx = await sushiswapRouter.swapExactETHForTokens(
    1, // Placeholder for minimum amount out, adjust as necessary
    [ethers.constants.AddressZero, tokenAddress],
    wallet.address,
    Math.floor(Date.now() / 1000) + 60 * 20,
    {
      value: ethers.utils.parseEther(amountIn.toString()),
      gasLimit: ethers.utils.hexlify(1000000)
    }
  );

  await tx.wait();
  console.log('Sushiswap trade executed:', tx.hash);
}

async function checkArbitrageOpportunity() {
  const trades = await getMempoolData();

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
setInterval(checkArbitrageOpportunity, 5000); // Check every 5 seconds
