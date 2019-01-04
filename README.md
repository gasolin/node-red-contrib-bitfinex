Bitfinex Function Node for Node-RED

[![npm version](https://img.shields.io/npm/v/node-red-contrib-bitfinex.svg)](https://www.npmjs.com/package/node-red-contrib-bitfinex)

## Install

```
npm install node-red-contrib-bitfinex
```

## Features

- A Function block where you can write your own code to execute [Bitfinex's nodejs API library](https://github.com/bitfinexcom/bitfinex-api-node)
- A credential configuration block
- Installed Blocks are provide in `bitfinex` category
- Guides and workable rest/websocket examples are provided in help tab
- expose [bfx method](https://github.com/bitfinexcom/bitfinex-api-node/blob/master/examples/bfx.js) in function block that allows advanced usage.
- expose `rest` method in function block to easy access [REST API](https://github.com/bitfinexcom/bitfinex-api-node/tree/master/examples/rest2) calls.
- expose `ws` in function block to easy access [Websocket API](https://github.com/bitfinexcom/bitfinex-api-node/tree/master/examples/ws2) calls

## Usage

Refer official Bitfinex document https://docs.bitfinex.com/v2/docs for all APIs.

Bitfinex API credentials can be obtained from [https://www.bitfinex.com/api](https://www.bitfinex.com/api)

## Credit

The block is derived from [node-red's build-in function block](https://github.com/node-red/node-red/blob/master/nodes/core/core/80-function.js). And refer [node-red-contrib-aws-sdk](https://github.com/cuongquay/node-red-contrib-aws-sdk) for the credential block.

The API is [Bitfinex's nodejs API library](https://github.com/bitfinexcom/bitfinex-api-node)

## License

MIT License
