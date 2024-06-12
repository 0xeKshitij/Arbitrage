## Prerequisites

1. Node.js and npm installed on your system.
2. Bitquery Free Developer Account with OAuth token (follow instructions here).
3. Wallet with some Arbitrum ETH for the transaction fees.
4. Wallet should also have some WETH. I have shown the demo with 0.0001 WETH. BUt you can use any other amount.

## Steps to run the bot on your Local Machine

1. `git clone https://github.com/0xeKshitij/Arbitrage`
2. `npm install`
3. Create a `.env` file
4. Add your `WALLET_PRIVATE_KEY`, `RPC_URL`, `UNISWAP_ROUTER_ADDRESS`, `SUSHISWAP_ROUTER_ADDRESS` and `BITQUERY_API_KEY` in the `.env` file. To get the OAuth Token follow these instructions [here](https://docs.bitquery.io/docs/authorisation/how-to-generate/).
5. Run this command in terminal to start the script `npm run start`.
6. Here 0.000001 is the amount of WETH you are swapping in a Uniswap pool with USDT token and subsequently swapping the USDT token for WETH in a Sushiswap on Ethereum Mainnet.