import { fake, Tas, make_deal, tas_split } from './deal'

type DuzState = string

type Side = 1 | 2 | 3 | 4

export function pov_side(pov: Side, side: Side): Side {
  let res = (side - pov + 1)
  if (res < 1) {
    return res + 4 as Side
  } else {
    return res as Side
  }
}

export function prev_side(side: Side): Side {
  if (side === 1) {
    return 4
  }
  return side - 1 as Side
}

export function next_side(side: Side): Side {
  if (side === 4) {
    return 1
  }
  return side + 1 as Side
}

export class DuzStack {

  static from_fen = (fen: string) => {
    let [state_board, waste_fen] = fen.split('W')

    let state = state_board[0]
    let board = tas_split(state_board.slice(1))
    let waste = tas_split(waste_fen)

    return new DuzStack(state, board, waste)
  }

  static make = (board: Tas[]) => {
    let state = board.length === 15 ? '>' : ' '
    return new DuzStack(state, board, [])
  }

  constructor(
    public state: DuzState,
    public board: Tas[],
    public waste: Tas[]) {}


  get fen() {

    let { state, board, waste } = this

    return `${state}${board.join('')}W${waste.join('')}`
  }

  get hide_board() {
    return new DuzStack(
      this.state,
      [],
      this.waste)
  }

  draw_tas(tas: Tas) {
    this.board.unshift(tas)
  }

  out_tas_no_waste(tas: Tas) {
    this.board.splice(this.board.findIndex(_ => _ === tas), 1)
  }

  out_tas(tas: Tas) {
    this.board.splice(this.board.findIndex(_ => _ === tas), 1)
    this.waste.push(tas)
  }
}

export class Dests {

  static get out() { return new Dests(true) }
  static get draw() { return new Dests(undefined, true) }
  static get empty() { return new Dests(undefined, undefined, true) }
  static get fin() { return new Dests(undefined, undefined, undefined, true) }

  constructor(
    public out?: true,
    public draw?: true,
    public empty?: true,
    public fin?: true) {
  } 


  get fen() {
    let { out, draw, empty, fin } = this

    if (out) { return 'out' }
    if (draw) { return 'draw' }
    if (empty) { return 'empty' }
    if (fin) { return 'fin' }
  }
}

export class DuzOkey4Pov {

  constructor(
    public okey: Tas,
    public stacks: DuzStack[],
    public end_tas?: Tas) {}

  get fen() {

    let { okey, stacks, end_tas } = this

    let end = end_tas ? ` .${end_tas}` : ''
    return `${okey} | ${stacks.map(_ => _.fen).join(' / ')}${end}`
  }
}

export class DuzOkey4 {

  static from_fen = (fen: string) => {
    let [header, rest] = fen.split(' | ')
    let [stacks_fen, middle_fen] = rest.split(' $ ')

    let okey = header
    
    let stacks = stacks_fen.split(' / ').map(_ => DuzStack.from_fen(_))
    let middle = tas_split(middle_fen)

    return new DuzOkey4(okey, stacks, middle)
  }

  static deal = (taslar: Tas[] = make_deal(true)) => {

    while (taslar[0] === fake) {
      taslar.push(taslar.shift()!)
    }

    let okey = taslar.splice(0, 1)[0]
    let stacks = [
      DuzStack.make(taslar.splice(0, 15)),
      DuzStack.make(taslar.splice(0, 14)),
      DuzStack.make(taslar.splice(0, 14)),
      DuzStack.make(taslar.splice(0, 14))
    ]
    let middle = taslar
    return new DuzOkey4(okey, stacks, middle)
  }

  constructor(
    public okey: Tas,
    public stacks: DuzStack[],
    public middle: Tas[],
    public end_tas?: Tas) {}

  get fen() {
    let { okey, stacks, middle, end_tas } = this
    let end = end_tas ? `.${end_tas}` : ''
    return `${okey} | ${stacks.map(_ => _.fen).join(' / ')} $ ${middle.join('')}${end}`
  }

  get action() {
    return this.stacks[this.action_side - 1]
  }

  get action_side() {
    return (this.stacks.findIndex(_ => _.state !== ' ') + 1) as Side
  }

  get previous_action_side() {
    return prev_side(this.action_side)
  }

  get in_action_next() {
    return next_side(this.action_side)
  }

  get dests() {
    let { action } = this
    
    if (action.state === '>') {
      return Dests.out
    }
    if (action.state === '<') {
      return Dests.draw
    }

    if (action.state === '.') {
      return Dests.fin
    }

    return Dests.empty
  }

  pov(side: Side) {

    let { okey, stacks, end_tas } = this

    let pov_stacks = stacks.slice(side - 1)

    if (side !== 1) {
      pov_stacks = [...pov_stacks, ...stacks.slice(0, side - 1)]
    }

    return new DuzOkey4Pov(okey,
                       pov_stacks.map((_, i) => i === 0 ? _ : _.hide_board),
                          end_tas)
  }


  act(action: string) {
    let events = new Events()

    let [cmd, tas] = action.split(' ')

    let { action_side } = this

    switch (cmd) {
      case 'end': {

        events.all(this.end(action_side, tas))

        events.all(this.change_state(action_side, '.'))
      } break
      case 'out': {

        let { in_action_next } = this

        events.all(this.out(action_side, tas))

        if (this.middle.length === 0) {
          events.all(this.change_state(action_side, '0'))
        } else {
          events.all(this.change_state(action_side, ' '))
          events.all(this.change_state(in_action_next, '<'))
        }
      } break
      case 'draw': {

        let { previous_action_side } = this

        let dt
        if (tas === 's') {
          dt = this.stacks[previous_action_side - 1].waste.splice(0, 1)[0]
        } else {
          dt = this.middle.splice(0, 1)[0]
        }

        events.all(this.draw(action_side, dt))
        events.all(this.change_state(action_side, '>'))
      } break
    }

    return events
  }

  private draw(side: Side, tas: Tas) {
    this.stacks[side - 1].draw_tas(tas)
    return new DrawTas(side, tas)
  }

  private end(side: Side, tas: Tas) {
    this.stacks[side - 1].out_tas_no_waste(tas)
    this.end_tas = tas
    return new EndTas(side, tas)
  }

  private out(side: Side, tas: Tas) {
    this.stacks[side - 1].out_tas(tas)
    return new OutTas(side, tas)
  }

  private change_state(side: Side, state: DuzState) {
    this.stacks[side - 1].state = state
    return new ChangeState(side, state)
  }
}
 

export abstract class Event {
    abstract pov(pov: Side): Event
}

export class DrawTas extends Event {

  constructor(readonly side: Side, readonly tas?: Tas) { super() }

  pov(pov: Side) {
    let tas = pov === this.side ? this.tas : undefined
    return new DrawTas(pov_side(pov, this.side), tas)
  }

  get fen() {
    let tas = this.tas ? ` ${this.tas}` : ''
    return `d ${this.side}${tas}`
  }
}


export class EndTas extends Event {

  constructor(readonly side: Side, readonly tas: Tas) { super() }

  pov(pov: Side) {
    return new EndTas(pov_side(pov, this.side), this.tas)
  }

  get fen() {
    return `e ${this.side} ${this.tas}`
  }
}

export class OutTas extends Event {

  constructor(readonly side: Side, readonly tas: Tas) { super() }

  pov(pov: Side) {
    return new OutTas(pov_side(pov, this.side), this.tas)
  }

  get fen() {
    return `o ${this.side} ${this.tas}`
  }
}

export class ChangeState extends Event {

  constructor(readonly side: Side, readonly state: DuzState) { super() }

  pov(pov: Side) {
    return new ChangeState(pov_side(pov, this.side), this.state)
  }

  get fen() {
    return `c ${this.side} ${this.state}`
  }
}

export class Events {

  events: Map<Side, Event[]>
  specs: Event[]

  constructor() {

    this.specs = []

    this.events = new Map()
    for (let i = 1; i <= 4; i++) { 
      let side = i as Side
      this.events.set(side, []) 
    }
  }

  others(pov: Side, events: Event | Event[]) {

    if (!Array.isArray(events)) {

      events = [events]
    }

    for (let event of events) {
      for (let i = 1; i <= 4; i++) {
        let side = i as Side
        if (side === pov) continue
        this.events.get(side)!.push(event.pov(side))
      }
      this.specs.push(event)
    }

  }

  all(events: Event | Event[]) {

    if (!Array.isArray(events)) {

      events = [events]
    }

    for (let event of events) {
      for (let i = 1; i <= 4; i++) {
        let side: Side = i as Side
        this.events.get(side)!.push(event.pov(side))
      }
      this.specs.push(event)
    }
  }

  only(s: Side, event: Event) {
    this.events.get(s)!.push(event.pov(s))
    this.specs.push(event)
  }

  pov(s: Side) {
    return this.events.get(s)
  }

  get spec() {
    return this.specs
  }
}
