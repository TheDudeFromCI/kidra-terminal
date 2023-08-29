import { Bot } from 'mineflayer'
import blessed from 'blessed'
import { CommandBuffer } from './Commands'

export class UserInterface {
  private readonly bot: Bot
  private readonly program: blessed.BlessedProgram
  private readonly screen: blessed.Widgets.Screen
  private readonly taskBox: blessed.Widgets.BoxElement
  private readonly activeBox: blessed.Widgets.BoxElement
  private readonly logBox: blessed.Widgets.BoxElement
  private readonly inputBox: blessed.Widgets.TextboxElement
  private readonly tasks: string[] = []
  private readonly processes: string[] = []
  private cmdReady: boolean = true

  readonly commandBuffer: CommandBuffer

  constructor (bot: Bot) {
    this.bot = bot
    this.commandBuffer = new CommandBuffer(this.bot)

    this.program = blessed.program({
      title: 'Mineflayer Bot'
    })

    this.screen = blessed.screen({
      smartCSR: true,
      program: this.program,
      dockBorders: true,
      terminal: 'ansi',
      title: 'Kidra Terminal'
    })
    this.screen.on('mouse', () => { })
    this.screen.key(['escape', 'C-c'], () => {
      this.program.clear()
      this.program.disableMouse()
      this.program.showCursor()
      this.program.normalBuffer()
      process.exit(0)
    })

    this.taskBox = blessed.box({
      top: 0,
      left: 0,
      height: 0,
      width: '100%',
      label: 'Active Tasks',
      border: 'line'
    })
    this.screen.append(this.taskBox)

    this.activeBox = blessed.box({
      top: 0,
      left: 0,
      height: 0,
      width: '100%',
      label: 'Active Processes',
      border: 'line'
    })
    this.screen.append(this.activeBox)

    this.logBox = blessed.box({
      height: '100%',
      width: '100%',
      label: 'Log',
      border: 'line',
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '['
      },
      mouse: true,
      content: '> '
    })
    this.screen.append(this.logBox)

    const inputForm = blessed.form({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3
    })
    this.screen.append(inputForm)

    this.inputBox = blessed.textbox({
      width: '100%',
      height: '100%',
      cursor: 'line',
      cursorBlink: true,
      label: 'Command Input',
      border: 'line',
      inputOnFocus: true
    })
    this.inputBox.on('submit', () => {
      const cmd = this.inputBox.getValue().trim()
      this.inputBox.clearValue()
      this.inputBox.focus()
      this.screen.render()
      this.commandBuffer.queue(cmd)
    })
    inputForm.append(this.inputBox)

    this.resizeBoxes()
    this.inputBox.focus()

    console.log = m => this.log(m)
    console.error = e => this.log(e)
  }

  addTask (task: string): number {
    this.tasks.push(task)
    this.taskBox.setContent(this.tasks.join('\n'))
    this.resizeBoxes()
    return this.tasks.length - 1
  }

  getTask (index: number): string {
    return this.tasks[index]
  }

  removeTask (index: number): void {
    this.tasks.splice(index, 1)
    this.taskBox.setContent(this.tasks.join('\n'))
    this.resizeBoxes()
  }

  addProcess (process: string): number {
    this.processes.push(process)
    this.activeBox.setContent(this.processes.join('\n'))
    this.resizeBoxes()
    return this.processes.length - 1
  }

  getProcess (index: number): string {
    return this.processes[index]
  }

  removeProcess (index: number): void {
    this.processes.splice(index, 1)
    this.activeBox.setContent(this.processes.join('\n'))
    this.resizeBoxes()
  }

  log (message: string): void {
    if (this.cmdReady) {
      const lineCount = this.logBox.getLines().length
      this.logBox.insertLine(lineCount - 1, message)
    } else {
      this.logBox.pushLine(message)
    }

    this.logBox.setScrollPerc(100.0)
    this.resizeBoxes()
  }

  enterCommand (message: string): void {
    if (this.cmdReady) {
      const lineCount = this.logBox.getLines().length
      this.logBox.setLine(lineCount - 1, '> ' + message)
      this.logBox.setScrollPerc(100.0)
      this.resizeBoxes()
      this.cmdReady = false
    } else {
      this.log('> ' + message)
    }
  }

  finishCommand (): void {
    if (this.cmdReady) return
    this.logBox.pushLine('> ')
    this.logBox.setScrollPerc(100.0)
    this.resizeBoxes()
    this.cmdReady = true
  }

  private resizeBoxes (): void {
    this.taskBox.height = Math.max(1, this.tasks.length) + 2
    this.activeBox.height = Math.max(1, this.processes.length) + 2
    this.activeBox.top = this.taskBox.height - 1
    this.logBox.top = this.activeBox.top + this.activeBox.height - 1
    this.logBox.height = '100%-' + (this.activeBox.top + this.activeBox.height - 1 + 2).toString()
    this.screen.render()
  }
}
