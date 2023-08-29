import { Bot } from 'mineflayer'
import { UserInterface } from './UserInterface'
import { pathfinder as pathfinderPlugin } from 'mineflayer-pathfinder'

declare module 'mineflayer' {
  interface Bot {
    terminal: UserInterface
  }
}

export function plugin (bot: Bot): void {
  bot.terminal = new UserInterface(bot)

  setTimeout(() => {
    if (bot.pathfinder == null) bot.loadPlugin(pathfinderPlugin)
  })
}
