import { spawn } from 'child_process'

// wrapper around `pinctrl` CLI
//
// see `pinctrl -h` for docs
//
// to set pin 8 as an output
// $ pinctrl set 8 op
//
// to drive pin 8 high
// $ pinctrl set 8 dh
//
// to drive pin 8 low
// $ pinctrl set 8 dl
export class Gpio {
  pin: number

  constructor(pin: number) {
    this.pin = pin

    this.#command('op')
  }

  low() {
    this.#command('dl')
  }

  high() {
    this.#command('dh')
  }

  #command(command: 'op' | 'dl' | 'dh') {
    spawn('pinctrl', ['set', String(this.pin), command])
  }
}
