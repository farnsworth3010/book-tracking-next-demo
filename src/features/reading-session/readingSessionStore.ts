import { makeAutoObservable } from 'mobx'

// MobX: fields become observables, getters become computeds, methods become actions
export class ReadingSessionStore {
  seconds = 0
  pages = 0
  timer: ReturnType<typeof setInterval> | undefined = undefined

  constructor() {
    makeAutoObservable(this)
  }

  get running() {
    return this.timer !== undefined
  }

  get elapsed() {
    const mm = String(Math.floor(this.seconds / 60)).padStart(2, '0')
    const ss = String(this.seconds % 60).padStart(2, '0')

    return `${mm}:${ss}`
  }

  get pagesPerHour() {
    return this.seconds === 0 ? 0 : Math.round(this.pages / (this.seconds / 3600))
  }

  start() {
    if (this.running) return

    this.timer = setInterval(() => this.tick(), 1000)
  }

  tick() {
    this.seconds += 1
  }

  pause() {
    clearInterval(this.timer)
    this.timer = undefined
  }

  addPage() {
    this.pages += 1
  }

  reset() {
    this.pause()
    this.seconds = 0
    this.pages = 0
  }
}
