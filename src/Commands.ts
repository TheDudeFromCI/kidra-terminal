import { Bot } from 'mineflayer'
import { AsyncCommand } from './commands/AsyncCommand'
import { SayCommand } from './commands/SayCommand'
import { WaitCommand } from './commands/WaitCommand'
import { GotoCommand } from './commands/GotoCommand'
import { QuitCommand } from './commands/QuitCommand'

export interface CommandExecution {
  readonly pid: number
  begin: () => void
  cancel: () => void
  isRunning: () => boolean
}

export interface CommandHandler {
  readonly cmdName: string
  execute: (args: string[], pid: number) => CommandExecution | null
}

export class Command {
  readonly name: string
  readonly args: string[]

  constructor (name: string, args: string[]) {
    this.name = name.toLowerCase()
    this.args = args
  }

  toString (): string {
    return [this.name, ...this.args].join(' ')
  }
}

export class CommandBuffer {
  private readonly bot: Bot
  private readonly buffer: Command[] = []
  private readonly handlers: CommandHandler[] = []
  private activeCmd: CommandExecution | null = null
  private readonly asyncCmds: CommandExecution[] = []
  private pidIncrement: number = 0

  constructor (bot: Bot) {
    this.bot = bot
    this.bot.on('physicsTick', () => this.update())

    this.addHandler(new SayCommand(bot))
    this.addHandler(new WaitCommand(bot))
    this.addHandler(new AsyncCommand(bot))
    this.addHandler(new GotoCommand(bot))
    this.addHandler(new QuitCommand(bot))
  }

  queue (cmd: string): void {
    const parsedCmd = parseCommand(cmd)
    this.buffer.push(parsedCmd)
  }

  addHandler (cmdHandler: CommandHandler): void {
    this.handlers.push(cmdHandler)
  }

  getHandler (cmdName: string): CommandHandler | null {
    cmdName = cmdName.toLowerCase()
    for (const handler of this.handlers) {
      if (handler.cmdName === cmdName) {
        return handler
      }
    }

    return null
  }

  runAsyncCommand (cmd: string): void {
    const parsedCmd = parseCommand(cmd)
    const handler = this.getHandler(parsedCmd.name)
    if (handler == null) {
      this.bot.terminal.log('Unknown command: ' + parsedCmd.name)
      return
    }

    const exec = handler.execute(parsedCmd.args, this.pidIncrement++)
    if (exec == null) return

    exec.begin()
    this.asyncCmds.push(exec)
    this.bot.terminal.log('Started Async Process. PID: ' + exec.pid.toString())
    this.bot.terminal.addProcess('PID ' + exec.pid.toString() + ' : ' + parsedCmd.toString())
  }

  private finishAsyncCommand (exec: CommandExecution): void {
    const index = this.asyncCmds.indexOf(exec)
    this.asyncCmds.splice(index, 1)
    this.bot.terminal.removeProcess(index)
    this.bot.terminal.log('Finished Async Process. PID ' + exec.pid.toString())
  }

  private update (): void {
    for (let i = this.asyncCmds.length - 1; i >= 0; i--) {
      if (this.asyncCmds[i].isRunning()) continue
      this.finishAsyncCommand(this.asyncCmds[i])
    }

    if (this.activeCmd == null) {
      this.triggerNextCmd()
      return
    }

    if (!this.activeCmd.isRunning()) {
      this.activeCmd = null
    }
  }

  private triggerNextCmd (): void {
    const next = this.buffer.shift()
    if (next == null) {
      this.bot.terminal.finishCommand()
      return
    }

    this.bot.terminal.enterCommand(next.toString())

    const handler = this.getHandler(next.name)
    if (handler == null) {
      this.bot.terminal.log('Unknown command: ' + next.name)
      return
    }

    this.activeCmd = handler.execute(next.args, this.pidIncrement++)
    if (this.activeCmd != null) this.activeCmd.begin()
  }
}

function parseCommand (cmd: string): Command {
  const args = cmd.split(/\s+(?=(?:(?:[^"]*"){2})*[^"]*$)/)
  const name = args.splice(0, 1)[0]
  return new Command(name, args)
}
