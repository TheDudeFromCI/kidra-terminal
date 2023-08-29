import { Bot } from 'mineflayer'
import { CommandHandler, CommandExecution } from '../Commands'

export class AsyncCommand implements CommandHandler {
  private readonly bot: Bot
  readonly cmdName: string = 'async'

  constructor (bot: Bot) {
    this.bot = bot
  }

  execute (args: string[]): CommandExecution | null {
    if (args.length === 0) {
      this.bot.terminal.log('Usage: async <command> [..args]')
    } else {
      const cmd = args.join(' ')
      this.bot.terminal.commandBuffer.runAsyncCommand(cmd)
    }

    return null
  }
}
