const { Fetcher, ChainId, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');
const { ethers, Contract } = require('ethers');
require('dotenv').config();

const chainId       = ChainId.SEPOLIA; // chain id (for mainnet - ChainId.MAINNET)
// Get .env params
const Account       = process.env.REACT_APP_ACCOUNT;
const PrivateKey    = process.env.REACT_APP_PRIVATE_KEY;
const RpcHttpUrl    = process.env.REACT_APP_RPC_HTTP_URL;
console.log('Account : ', Account);

const Provider      = new ethers.getDefaultProvider(RpcHttpUrl);
const HexPrivateKey = new Buffer.from(PrivateKey, "hex"); //convert private key to HEX format
const Signer        = new ethers.Wallet(HexPrivateKey, Provider); //used to sign transactions

async function run_basics(){
    // Get ether balance
    const balance       = await Provider.getBalance(Account);
    console.log('ETH Balance (wei): ', balance.toString());   
    // Convert ETH from Wei to Ether
    const balanceInEth  = ethers.utils.formatEther(balance);
    console.log('ETH Balance :', balanceInEth);
    // Convert ETH to Wei
    console.log('ETH to Wei Conversion: ', ethers.utils.parseEther("1.0").toString());

    // Get Block Number 
    const blockNumber   = await Provider.getBlockNumber();
    console.log('Block Number :', blockNumber);
}

// Tranfer ETH
async function transfer_eth(){
    // Tranfer ETH to others
    const transaction = await Signer.sendTransaction({
        // should use in .env or from user input
        to: "0xe7ed092D58f9065BD3675f5Ea82a37105Fb66681", // receiver wallet address 
        value: ethers.utils.parseEther("0.1") // eth amount to tranfer (in wei)
    });
    console.log(transaction.hash);
}

// Transfer ERC20 token
async function transfer_erc20(){
    // token address
    const tokenAddress  = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709"; // get from user input or .env
    const tokenAbi      = [
        // same for each erc20 token
        // Get Balance
        "function balanceOf(address) view returns (uint)", 
        // transfer 
        "function transfer(address to, uint amount)"
        // token name
        // token symbol
        // etc
    ];
    // token contract
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, Provider);

    // Get token balance
    const tokenBalance  = await tokenContract.balanceOf(Account);
    console.log('Token Balance : ', tokenBalance.toString());
    // convert to decimal 
    console.log('Token Balance in decimal : ',ethers.utils.formatUnits(tokenBalance, 18));

    // Transfer erc20 token
    const tokenSigner   = tokenContract.connect(Signer); 
    // transfer
    const tokenAmount   = ethers.utils.parseUnits("4.0", 18);
    const transaction   = await tokenSigner.transfer("0xe7ed092D58f9065BD3675f5Ea82a37105Fb66681", tokenAmount);

    console.log('Token transfer Hash : ', transaction.hash);
}

//uniswap swap function
async function uniswap(){
    const routerAddress     = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // uniswap router
    const uniswapAbi        = [
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) \
        external \
        payable \
        returns (uint[] memory amounts)"
        // other swap functions 
    ]; // uniswap router abi
    const uniswapContract   = new ethers.Contract(routerAddress, uniswapAbi, Provider); // uniswap contract
    const uniswapSigner     = uniswapContract.connect(Signer);

    // token to swap and configs
    const token             = await Fetcher.fetchTokenData(chainId, "0x9A9410d7d6a59C970F45C19404902D2093e97D66", Provider); // fetch token details
    const weth              = WETH[chainId]; // wrapped ETH
    const pair              = await Fetcher.fetchPairData(token, weth, Provider); // liquidity pool pair 
    const route             = new Route([pair], weth);
    
    // transaction params
    const swapAmount        = ethers.utils.parseEther("0.001"); // swap ETH amount in wei
    const trade             =  new Trade(route, 
                                    new TokenAmount(weth, swapAmount), 
                                    TradeType.EXACT_INPUT); // trade info. to get details
    // amountOutMin
    const slippage          = new Percent("10000", "1000"); // slippage in price. (Note - keep this minimum to get transaction through)
    const amountOut         = trade.minimumAmountOut(slippage).raw; // from trade
    const amountOutMin      = ethers.BigNumber.from(amountOut.toString()).toHexString(); // convert to Hex
    // path
    const path              = [weth.address, token.address]; // route path
    // to - Account address
    // deadline
    const deadlineTime      = Math.floor(Date.now() / 1000) + 60 * 20; // current time + 20 mins 
    const deadline          = ethers.BigNumber.from(deadlineTime.toString()).toHexString(); // convert to Hex
    // value or input swap amount
    const input             = trade.inputAmount.raw;
    const inputAmount       = ethers.BigNumber.from(input.toString()).toHexString(); // convert to Hex     

    // Transaction
    const transaction       = await uniswapSigner.swapExactETHForTokens(
        amountOutMin,
        path,
        Account,
        deadline,
        { value: inputAmount}
    );
    console.log("Swap Transaction Hash : ", transaction.hash);
}

run_basics()
//transfer_eth()
//transfer_erc20()
uniswap()