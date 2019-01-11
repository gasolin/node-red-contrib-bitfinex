Bitfinex Function Node for Node-RED

[![npm version](https://img.shields.io/npm/v/node-red-contrib-bitfinex.svg)](https://www.npmjs.com/package/node-red-contrib-bitfinex)

`node-red-contrib-bitfinex` make Bitfinex API very easy to access, you can visually show exchange data in node-red's dashboard, mashup with other services, or trade from weird objects around your house.

## Install

1. Install Node-RED `npm install -g node-red`
2. Go to Node-RED user directory (default: `~/.node-red`)
3. `npm install node-red-contrib-bitfinex`

Or start Node-RED via `node-red`, then go `settings > Palette > Install` tab in node-red and search `bitfinex` to install this module.

## Features

- A Function block where you can write your own code to execute [Bitfinex's nodejs API library](https://github.com/bitfinexcom/bitfinex-api-node)

![Imgur](https://i.imgur.com/BDWezQx.png)

- A credential configuration block

![Imgur](https://i.imgur.com/0eVeu4I.png)

- Installed Blocks are provide in `bitfinex` category
- Guides and workable rest/websocket examples are provided in help tab
- expose `rest` method in function block to easy access [REST API](https://github.com/bitfinexcom/bitfinex-api-node/tree/master/examples/rest2) calls.

![Imgur](https://i.imgur.com/ivFAJWH.gif)

- expose `ws` in function block to easy access [Websocket API](https://github.com/bitfinexcom/bitfinex-api-node/tree/master/examples/ws2) calls

![Imgur](https://i.imgur.com/ecJV6Io.gif)

- expose `bfx` method in function block that allows [advanced usage](https://github.com/bitfinexcom/bitfinex-api-node/blob/master/examples/bfx.js).
- `rest`, `ws` returned data are auto transformed to object based on [bfx-api-node-models](https://github.com/bitfinexcom/bfx-api-node-models)
- The functoin block supports multiple outputs (ex: can subscribe multiple tickers and export at the same block)

![Imgur](https://i.imgur.com/MLS7sCq.gif)

- You can visualize value and diagram with [Node-RED dashboard](https://flows.nodered.org/node/node-red-dashboard)

![Imgur](https://i.imgur.com/mow1AUX.gif)

## Usage

Refer official Bitfinex document https://docs.bitfinex.com/v2/docs for all APIs.

Bitfinex API credentials can be obtained from [https://www.bitfinex.com/api](https://www.bitfinex.com/api)

## Credit

The block is derived from [node-red's build-in function block](https://github.com/node-red/node-red/blob/master/nodes/core/core/80-function.js). And refer [node-red-contrib-aws-sdk](https://github.com/cuongquay/node-red-contrib-aws-sdk) for the credential block.

The functions are build on top of [Bitfinex's nodejs API library](https://github.com/bitfinexcom/bitfinex-api-node)

## License

MIT License
