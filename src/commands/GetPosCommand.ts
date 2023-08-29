import { Bot } from 'mineflayer'
import { CommandHandler, CommandExecution } from '../Commands'

export class GetPosCommand implements CommandHandler {
  private readonly bot: Bot
  readonly cmdName: string = 'get_pos'

  constructor (bot: Bot) {
    this.bot = bot
  }

  execute (args: string[]): CommandExecution | null {
    if (args.length === 0) {
      const pos = this.bot.entity.position
      const x = String(Math.floor(pos.x))
      const y = String(Math.floor(pos.y))
      const z = String(Math.floor(pos.z))
      this.bot.terminal.log('Pos: ' + x + ', ' + y + ', ' + z)
    } else {
      this.bot.terminal.log('Usage: get_pos')
    }

    return null
  }
}
