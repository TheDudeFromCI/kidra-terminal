import { Bot } from 'mineflayer'
import { CommandHandler, CommandExecution } from '../Commands'

export class QuitCommand implements CommandHandler {
  private readonly bot: Bot
  readonly cmdName: string = 'quit'

  constructor (bot: Bot) {
    this.bot = bot
  }

  execute (args: string[]): CommandExecution | null {
    if (args.length === 0) {
      this.bot.quit()
    } else {
      this.bot.terminal.log('Usage: quit')
    }

    return null
  }
}
