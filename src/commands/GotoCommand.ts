import { Bot, BotEvents } from 'mineflayer'
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

class TemporaryEvent<K extends keyof BotEvents> {
  private readonly bot: Bot
  private readonly event: K
  private readonly callback: BotEvents[K]

  constructor (bot: Bot, event: K, callback: BotEvents[K]) {
    this.bot = bot
    this.event = event
    this.callback = callback
    this.bot.on(event, callback)
  }

  cleanup (): void {
    this.bot.removeListener(this.event, this.callback)
  }
}

class GotoExecution implements CommandExecution {
  private readonly bot: Bot
  private readonly goal: goals.Goal
  private readonly events: Array<TemporaryEvent<any>> = []
  private running: boolean = true

  readonly pid: number

  constructor (bot: Bot, pid: number, goal: goals.Goal) {
    this.bot = bot
    this.goal = goal
    this.pid = pid
  }

  begin (): void {
    this.bot.pathfinder.setGoal(this.goal, false)

    this.events.push(new TemporaryEvent(this.bot, 'goal_reached', () => {
      this.running = false
    }))

    this.events.push(new TemporaryEvent(this.bot, 'goal_updated', () => {
      if (this.running) this.error('goal changed unexpectedly')
    }))

    this.events.push(new TemporaryEvent(this.bot, 'path_stop', () => {
      if (this.running) this.error('path force stopped')
    }))

    this.events.push(new TemporaryEvent(this.bot, 'path_update', path => {
      if (!this.running) return
      if (path.status === 'noPath') this.error('no path found')
      if (path.status === 'timeout') this.error('calculation timed out')
    }))
  }

  cancel (): void {
    this.running = false
    this.bot.pathfinder.setGoal(null)
  }

  isRunning (): boolean {
    return this.running
  }

  cleanup (): void {
    this.running = false
    for (const event of this.events) event.cleanup()
  }

  private error (message: string): void {
    this.bot.terminal.warn('PID ' + String(this.pid) + ' failed; ' + message)
    this.running = false
  }
}
