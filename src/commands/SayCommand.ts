import { Bot } from 'mineflayer'
import { CommandHandler, CommandExecution } from '../Commands'

export class SayCommand implements CommandHandler {
  private readonly bot: Bot
  readonly cmdName: string = 'say'

  constructor (bot: Bot) {
    this.bot = bot
  }

  execute (args: string[]): CommandExecution | null {
    if (args.length === 1) {
      this.bot.chat(args[0])
    } else {
      this.bot.terminal.log('Usage: say <message>')
    }

    return null
  }
}
