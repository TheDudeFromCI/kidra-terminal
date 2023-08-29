import { Bot } from 'mineflayer'
import { UserInterface } from './UserInterface'
import { Command } from './Commands'

declare module 'mineflayer' {
  interface Bot {
    terminal: UserInterface
  }
  interface BotEvents {
    'command': (cmd: Command) => void
  }
}

export default function plugin(bot: Bot): void {
  bot.terminal = new UserInterface(bot)
}
