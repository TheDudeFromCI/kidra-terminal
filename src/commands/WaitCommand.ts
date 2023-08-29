import { Bot } from 'mineflayer'
import { CommandHandler, CommandExecution } from '../Commands'

export class WaitCommand implements CommandHandler {
  private readonly bot: Bot
  readonly cmdName: string = 'wait'

  constructor (bot: Bot) {
    this.bot = bot
  }

  execute (args: string[], pid: number): CommandExecution | null {
    if (args.length !== 1) {
      this.bot.terminal.log('Usage: wait <seconds>')
      return null
    }

    const seconds = parseFloat(args[0])
    if (Number.isNaN(seconds)) {
      this.bot.terminal.log('Error: \'' + args[0] + '\' is not a number!')
      return null
    }

    return new WaitExecution(seconds, pid)
  }
}

class WaitExecution implements CommandExecution {
  private readonly waitTime: number
  private endTime: number = 0
  readonly pid: number

  constructor (waitTime: number, pid: number) {
    this.waitTime = waitTime
    this.pid = pid
  }

  begin (): void {
    this.endTime = Date.now() + this.waitTime * 1000.0
  }

  cancel (): void {
    this.endTime = 0
  }

  isRunning (): boolean {
    return Date.now() < this.endTime
  }
}
