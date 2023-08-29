const mineflayer = require('mineflayer')
const terminalPlugin = require('kidra_terminal').plugin

if (process.argv.length !== 5) {
  console.log('Usage : node basic.js <host> <port> <email>')
  process.exit(1)
}

const bot = mineflayer.createBot({
  host: process.argv[2],
  port: process.argv[3],
  username: process.argv[4],
  auth: 'microsoft'
})

bot.loadPlugin(terminalPlugin)
