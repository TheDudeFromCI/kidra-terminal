import { Bot } from 'mineflayer'
import { CommandHandler, CommandExecution } from '../Commands'
import { goals } from 'mineflayer-pathfinder'

export class GotoCommand implements CommandHandler {
  private readonly bot: Bot
  readonly cmdName: string = 'goto'

  constructor (bot: Bot) {
    this.bot = bot
  }

  execute (args: string[], pid: number): CommandExecution | null {
    if (args.length === 0) return this.printUsage()
    switch (args[0].toLowerCase()) {
      case 'pos': return this.parsePos(args, pid)
      case 'xz': return this.parseXZ(args, pid)
      case 'y': return this.parseY(args, pid)
      default: return this.printUsage()
    }
  }

  private printUsage (): null {
    this.bot.terminal.log('Usage: goto pos <x> <y> <z> <range>')
    this.bot.terminal.log('     : goto xz <x> <z> <range>')
    this.bot.terminal.log('     : goto y <y>')
    return null
  }

  private warnNan (arg: string): null {
    this.bot.terminal.log('Error: \'' + arg + '\' is not a number!')
    return null
  }

  private parsePos (args: string[], pid: number): CommandExecution | null {
    if (args.length !== 5) return this.printUsage()

    const x = parseInt(args[1])
    const y = parseInt(args[2])
    const z = parseInt(args[3])
    const r = parseInt(args[4])

    if (Number.isNaN(x)) return this.warnNan(args[1])
    if (Number.isNaN(y)) return this.warnNan(args[2])
    if (Number.isNaN(z)) return this.warnNan(args[3])
    if (Number.isNaN(r)) return this.warnNan(args[4])

    const goal = new goals.GoalNear(x, y, z, r)
    return new GotoExecution(this.bot, pid, goal)
  }

  private parseXZ (args: string[], pid: number): CommandExecution | null {
    if (args.length !== 4) return this.printUsage()

    const x = parseInt(args[1])
    const z = parseInt(args[2])
    const r = parseInt(args[3])

    if (Number.isNaN(x)) return this.warnNan(args[1])
    if (Number.isNaN(z)) return this.warnNan(args[2])
    if (Number.isNaN(r)) return this.warnNan(args[3])

    const goal = new goals.GoalNearXZ(x, z, r)
    return new GotoExecution(this.bot, pid, goal)
  }

  private parseY (args: string[], pid: number): CommandExecution | null {
    if (args.length !== 2) return this.printUsage()

    const y = parseInt(args[1])
    if (Number.isNaN(y)) return this.warnNan(args[1])

    const goal = new goals.GoalY(y)
    return new GotoExecution(this.bot, pid, goal)
  }
}

class GotoExecution implements CommandExecution {
  private readonly bot: Bot
  private readonly goal: goals.Goal
  readonly pid: number

  constructor (bot: Bot, pid: number, goal: goals.Goal) {
    this.bot = bot
    this.goal = goal
    this.pid = pid
  }

  begin (): void {
    this.bot.pathfinder.setGoal(this.goal, false)
  }

  cancel (): void {
    this.bot.pathfinder.setGoal(null)
  }

  isRunning (): boolean {
    return this.bot.pathfinder.isMoving()
  }
}
