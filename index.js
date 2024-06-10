require('dotenv').config();
const { ethers } =  require('ethers');
const axios = require('axios');
const { AlphaRouter, SwapType } = require('@uniswap/smart-order-router');
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core');
const { getUniswapTrades, config } = require('./uniswapData');
const { getSushiswapTrades, config2 } = require('./sushiswapData');

const RPC_ENDPOINT = "https://eth-sepolia.g.alchemy.com/v2/qsmBqL-17wbolk3wYM-Lw4QkMhZzinqb";
const PRIVATE_KEY = "..";
const UNISWAP_ROUTER_ADDRESS = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";
const SUSHISWAP_ROUTER_ADDRESS = "0xeaBcE3E74EF41FB40024a21Cc2ee2F5dDc615791";

const provider = new ethers.getDefaultProvider(RPC_ENDPOINT);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const router = new AlphaRouter({ chainId: 11155111, wallet });

async function executeUniswapTrade(_wethAddress, tokenAddress, amountIn) {
  try {
    console.log(`Executing Uniswap trade with WETH: ${_wethAddress}, Token: ${tokenAddress}, Amount: ${amountIn}`);
    
    const wethAddress = _wethAddress;
    const token = new Token(1, tokenAddress, 18); // 1 is the chainId for Ethereum mainnet

    const amountInCurrency = CurrencyAmount.fromRawAmount(token, ethers.parseEther(amountIn.toString()).toString());
    console.log('Amount in currency:', amountInCurrency.toExact());

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
    console.log('Route:', route);

    const transaction = {
      data: route.methodParameters.calldata,
      to: UNISWAP_ROUTER_ADDRESS,
      value: route.methodParameters.value,
      from: wallet.address,
      gasPrice: ethers.utils.parseUnits('20', 'gwei'),
      gasLimit: ethers.utils.hexlify(1000000)
    };
    console.log('Transaction:', transaction);

    const txResponse = await wallet.sendTransaction(transaction);
    console.log('Transaction response:', txResponse);

    await txResponse.wait();
    console.log('Uniswap trade executed:', txResponse.hash);
  } catch (error) {
    console.error('Error executing Uniswap trade:', error);
  }
}

async function executeSushiswapTrade(tokenAddress, amountIn) {
  console.log(`Executing Sushiswap trade with Token: ${tokenAddress}, Amount: ${amountIn}`);
  try {
    // Sushiswap trade execution logic here
    console.log('Sushiswap trade executed');
  } catch (error) {
    console.error('Error executing Sushiswap trade:', error);
  }
}

async function checkArbitrageOpportunity() {
  console.log('Checking arbitrage opportunities');
  try {
    const uniswapTrades = await getUniswapTrades(config);
    console.log('Uniswap trades:', uniswapTrades);

    const sushiswapTrades = await getSushiswapTrades(config2);
    console.log('Sushiswap trades:', sushiswapTrades);

    for (let index in sushiswapTrades) {
      let priceOnUniswap = uniswapTrades[index].Trade.Buy.PriceInUSD;
      let priceOnSushiswap = sushiswapTrades[index].Trade.Buy.PriceInUSD;

      console.log(`Price on Uniswap: ${priceOnUniswap}, Price on Sushiswap: ${priceOnSushiswap}`);

      if (priceOnUniswap != priceOnSushiswap) { // Arbitrage condition, can be adjusted
        const token0Address = uniswapTrades[index].Trade.Buy.Currency.SmartContract;
        const token1Address = uniswapTrades[index].Trade.Sell.Currency.SmartContract;
        const amountIn = 1; // Amount in ETH, can be adjusted

        console.log(`Arbitrage detected. Executing trades for Token0: ${token0Address}, Token1: ${token1Address}, Amount: ${amountIn}`);

        // await executeUniswapTrade(token0Address, token1Address, amountIn);

        // // Check balance of the token after Uniswap trade
        // const tokenContract = new ethers.Contract(token1Address, ['function balanceOf(address owner) view returns (uint256)'], provider);
        // const tokenBalance = await tokenContract.balanceOf(wallet.address);
        // console.log(`Token balance after Uniswap trade: ${tokenBalance}`);

        // // Execute trade on Sushiswap
        // await executeSushiswapTrade(token1Address, ethers.utils.formatUnits(tokenBalance, 18));

        console.log('Arbitrage opportunity executed.');
      }
    }
  } catch (error) {
    console.error('Error checking arbitrage opportunities:', error);
  }
}

// Run the bot every 5 seconds
setInterval(checkArbitrageOpportunity, 5000);
