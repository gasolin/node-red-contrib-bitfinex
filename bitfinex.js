module.exports = function (RED) {
  'use strict'

  var util = require('util')
  var vm = require('vm')
  var BFX = require('bitfinex-api-node')

  function BitfinexNode (config) {
    RED.nodes.createNode(this, config)
    var node = this
    node.status({})
    node.bitfinex = require('bitfinex-api-node')

    if (!node.credentials ||
        !node.credentials.apiKey ||
        !node.credentials.apiSecret) {
      console.error('Missing bitfinex API credentials')
      node.error(RED._('bitfinex.errors.missing-conf'))
    }
  }

  RED.nodes.registerType('bitfinex-credentials', BitfinexNode, {
    credentials: {
      apiKey: { type: 'password' },
      apiSecret: { type: 'password' }
    }
  })

  // function node from https://github.com/node-red/node-red/blob/master/nodes/core/core/80-function.js
  function sendResults (node, _msgid, msgs) {
    if (msgs == null) {
      return
    } else if (!Array.isArray(msgs)) {
      msgs = [msgs]
    }
    var msgCount = 0

    for (var m = 0; m < msgs.length; m++) {
      if (msgs[m]) {
        if (!Array.isArray(msgs[m])) {
          msgs[m] = [msgs[m]]
        }
        for (var n = 0; n < msgs[m].length; n++) {
          var msg = msgs[m][n]
          if (msg !== null && msg !== undefined) {
            if (typeof msg === 'object' && !Buffer.isBuffer(msg) && !Array.isArray(msg)) {
              msg._msgid = _msgid
              msgCount++
            } else {
              var type = typeof msg
              if (type === 'object') {
                type = Buffer.isBuffer(msg) ? 'Buffer' : (Array.isArray(msg) ? 'Array' : 'Date')
              }
              node.error(RED._('function.error.non-message-returned', { type: type }))
            }
          }
        }
      }
    }
    if (msgCount > 0) {
      node.send(msgs)
    }
  };

  function BfxFuncNode (config) {
    RED.nodes.createNode(this, config)
    var node = this
    this.name = config.name
    this.func = config.func
    this.bfxConfig = RED.nodes.getNode(config.config)
    const { apiKey, apiSecret } = this.bfxConfig
    const bfx = this.bfxConfig
      ? new BFX({ apiKey, apiSecret })
      : new BFX()
    var functionText = 'var results = null;' +
                         'results = (function(msg){ ' +
                           'var __msgid__ = msg._msgid;' +
                           'var node = {' +
                             'id:__node__.id,' +
                             'name:__node__.name,' +
                             'log:__node__.log,' +
                             'error:__node__.error,' +
                             'warn:__node__.warn,' +
                             'debug:__node__.debug,' +
                             'trace:__node__.trace,' +
                             'on:__node__.on,' +
                             'status:__node__.status,' +
                             'send:function(msgs){ __node__.send(__msgid__,msgs);}' +
                           '};\n' +
                           this.func + '\n' +
                          '})(msg);'

    var sandbox = {
      callback: function (results) {
        sendResults(node, node.name, results)
      },
      bfx,
      rest: bfx.rest(2),
      ws: bfx.ws(2),
      console,
      util,
      Buffer,
      Date,
      RED: {
        util: RED.util
      },
      __node__: {
        id: node.id,
        name: node.name,
        log: function () {
          node.log.apply(node, arguments)
        },
        error: function () {
          node.error.apply(node, arguments)
        },
        warn: function () {
          node.warn.apply(node, arguments)
        },
        debug: function () {
          node.debug.apply(node, arguments)
        },
        trace: function () {
          node.trace.apply(node, arguments)
        },
        send: function (id, msgs) {
          sendResults(node, id, msgs)
        },
        on: function () {
          if (arguments[0] === 'input') {
            throw new Error(RED._('function.error.inputListener'))
          }
          node.on.apply(node, arguments)
        },
        status: function () {
          node.status.apply(node, arguments)
        }
      },
      context: {
        set: function () {
          node.context().set.apply(node, arguments)
        },
        get: function () {
          return node.context().get.apply(node, arguments)
        },
        keys: function () {
          return node.context().keys.apply(node, arguments)
        },
        get global () {
          return node.context().global
        },
        get flow () {
          return node.context().flow
        }
      },
      flow: {
        set: function () {
          node.context().flow.set.apply(node, arguments)
        },
        get: function () {
          return node.context().flow.get.apply(node, arguments)
        },
        keys: function () {
          return node.context().flow.keys.apply(node, arguments)
        }
      },
      global: {
        set: function () {
          node.context().global.set.apply(node, arguments)
        },
        get: function () {
          return node.context().global.get.apply(node, arguments)
        },
        keys: function () {
          return node.context().global.keys.apply(node, arguments)
        }
      },
      setTimeout: function () {
        var func = arguments[0]
        var timerId
        arguments[0] = function () {
          sandbox.clearTimeout(timerId)
          try {
            func.apply(this, arguments)
          } catch (err) {
            node.error(err, {})
          }
        }
        timerId = setTimeout.apply(this, arguments)
        node.outstandingTimers.push(timerId)
        return timerId
      },
      clearTimeout: function (id) {
        clearTimeout(id)
        var index = node.outstandingTimers.indexOf(id)
        if (index > -1) {
          node.outstandingTimers.splice(index, 1)
        }
      },
      setInterval: function () {
        var func = arguments[0]
        var timerId
        arguments[0] = function () {
          try {
            func.apply(this, arguments)
          } catch (err) {
            node.error(err, {})
          }
        }
        timerId = setInterval.apply(this, arguments)
        node.outstandingIntervals.push(timerId)
        return timerId
      },
      clearInterval: function (id) {
        clearInterval(id)
        var index = node.outstandingIntervals.indexOf(id)
        if (index > -1) {
          node.outstandingIntervals.splice(index, 1)
        }
      }
    }
    if (util.hasOwnProperty('promisify')) {
      sandbox.setTimeout[util.promisify.custom] = function (after, value) {
        return new Promise(function (resolve, reject) {
          sandbox.setTimeout(function () { resolve(value) }, after)
        })
      }
    }
    var context = vm.createContext(sandbox)
    try {
      this.script = vm.createScript(functionText, {
        filename: 'Function node:' + this.id + (this.name ? ' [' + this.name + ']' : ''), // filename for stack traces
        displayErrors: true
        // Using the following options causes node 4/6 to not include the line number
        // in the stack output. So don't use them.
        // lineOffset: -11, // line number offset to be used for stack traces
        // columnOffset: 0, // column number offset to be used for stack traces
      })
      this.on('input', function (msg) {
        try {
          var start = process.hrtime()
          context.msg = msg
          node.script.runInContext(context)
          sendResults(node, msg._msgid, context.results)

          var duration = process.hrtime(start)
          var converted = Math.floor((duration[0] * 1e9 + duration[1]) / 10000) / 100
          node.metric('duration', msg, converted)
          if (process.env.NODE_RED_FUNCTION_TIME) {
            node.status({
              fill: 'yellow',
              shape: 'dot',
              text: '' + converted
            })
          }
        } catch (err) {
          // remove unwanted part
          var index = err.stack.search(/\n\s*at ContextifyScript.Script.runInContext/)
          err.stack = err.stack.slice(0, index).split('\n').slice(0, -1).join('\n')
          var stack = err.stack.split(/\r?\n/)

          // store the error in msg to be used in flows
          msg.error = err

          var line = 0
          var errorMessage
          if (stack && stack.length > 0) {
            while (line < stack.length && stack[line].indexOf('ReferenceError') !== 0) {
              line++
            }

            if (line < stack.length) {
              errorMessage = stack[line]
              var m = /:(\d+):(\d+)$/.exec(stack[line + 1])
              if (m) {
                var lineno = Number(m[1]) - 1
                var cha = m[2]
                errorMessage += ' (line ' + lineno + ', col ' + cha + ')'
              }
            }
          }
          if (!errorMessage) {
            errorMessage = err.toString()
          }
          node.error(errorMessage, msg)
        }
      })
      this.on('close', function () {
        while (node.outstandingTimers.length > 0) {
          clearTimeout(node.outstandingTimers.pop())
        }
        while (node.outstandingIntervals.length > 0) {
          clearInterval(node.outstandingIntervals.pop())
        }
        this.status({})
      })
    } catch (err) {
      // eg SyntaxError - which v8 doesn't include line number information
      // so we can't do better than this
      this.error(err)
    }
  }

  RED.nodes.registerType('Bitfinex function', BfxFuncNode)
}
