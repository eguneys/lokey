import { it, expect } from 'vitest'
import { DuzOkey4, make_deal } from '../src'

it('draws side', () => {

  let r = DuzOkey4.from_fen(`ra |  r2r4r5r6r7r8r9rtrjrqrkrar2r3Wr3 / <r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ ff`)

  expect(r.dests.fen).toBe('draw')

  let events = r.act('draw s')

  expect(r.fen).toBe(`ra |  r2r4r5r6r7r8r9rtrjrqrkrar2r3W / >r3r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ ff`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['s 2 r3', 'c 2 >'])
  expect(events.pov(2).map(_ => _.fen)).toStrictEqual(['s 1 r3', 'c 1 >'])

})

it('empties middle', () => {

  let r = DuzOkey4.from_fen(`ra | >r2r3r4r5r6r7r8r9rtrjrqrkrar2r3W /  r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ ff`)

  expect(r.dests.fen).toBe('out')

  let events = r.act('out r3')

  expect(r.fen).toBe(`ra |  r2r4r5r6r7r8r9rtrjrqrkrar2r3Wr3 / <r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ ff`)

  events = r.act('draw')

  expect(r.fen).toBe(`ra |  r2r4r5r6r7r8r9rtrjrqrkrar2r3Wr3 / >ffr4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ `)

  events = r.act('out ff')

  expect(r.fen).toBe(`ra |  r2r4r5r6r7r8r9rtrjrqrkrar2r3Wr3 / 0r4r5r6r7r8r9rtrjrqrkgag2g3g4Wff /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ `)

  expect(r.dests.fen).toBe('empty')
})

it('ends with fin', () => {

  let r = DuzOkey4.from_fen(`ra | >r2r3r4r5r6r7r8r9rtrjrqrkrar2r3W /  r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ b7b8b9btbjbqbkbab2b3b4b5b6b7b8b9btbjbqbklal2l3l4l5l6l7l8l9ltljlqlklal2l3l4l5l6l7l8l9ltljlqlkffff`)

  expect(r.dests.fen).toBe('out')

  let events = r.act('end r3')

  expect(r.fen).toBe(`ra | .r2r4r5r6r7r8r9rtrjrqrkrar2r3W /  r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ b7b8b9btbjbqbkbab2b3b4b5b6b7b8b9btbjbqbklal2l3l4l5l6l7l8l9ltljlqlklal2l3l4l5l6l7l8l9ltljlqlkffff.r3`)

  expect(r.pov(1).fen).toBe(`ra | .r2r4r5r6r7r8r9rtrjrqrkrar2r3W /  W /  W /  W .r3`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['e 1 r3', 'c 1 .'])
  expect(events.pov(2).map(_ => _.fen)).toStrictEqual(['e 4 r3', 'c 4 .'])

  expect(r.dests.fen).toBe('fin')
})

it('first playout draw out acts events pov', () => {

  let r = DuzOkey4.deal(make_deal())

  expect(r.fen).toBe(`ra | >r2r3r4r5r6r7r8r9rtrjrqrkrar2r3W /  r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ b7b8b9btbjbqbkbab2b3b4b5b6b7b8b9btbjbqbklal2l3l4l5l6l7l8l9ltljlqlklal2l3l4l5l6l7l8l9ltljlqlkffff`)

  expect(r.pov(1).fen).toBe(`ra | >r2r3r4r5r6r7r8r9rtrjrqrkrar2r3W /  W /  W /  W`)
  expect(r.pov(2).fen).toBe(`ra |  r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  W /  W / >W`)
  expect(r.pov(3).fen).toBe(`ra |  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  W / >W /  W`)
  expect(r.pov(4).fen).toBe(`ra |  g6g7g8g9gtgjgqgkbab2b3b4b5b6W / >W /  W /  W`)

  let povs = [r.pov(1), r.pov(2), r.pov(3), r.pov(4)]

  expect(r.dests.fen).toBe('out')

  let events = r.act('out r2')

  expect(r.fen).toBe(`ra |  r3r4r5r6r7r8r9rtrjrqrkrar2r3Wr2 / <r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ b7b8b9btbjbqbkbab2b3b4b5b6b7b8b9btbjbqbklal2l3l4l5l6l7l8l9ltljlqlklal2l3l4l5l6l7l8l9ltljlqlkffff`)

  expect(r.pov(1).fen).toBe(`ra |  r3r4r5r6r7r8r9rtrjrqrkrar2r3Wr2 / <W /  W /  W`)
  expect(r.pov(2).fen).toBe(`ra | <r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  W /  W /  Wr2`)
  expect(r.pov(3).fen).toBe(`ra |  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  W /  Wr2 / <W`)
  expect(r.pov(4).fen).toBe(`ra |  g6g7g8g9gtgjgqgkbab2b3b4b5b6W /  Wr2 / <W /  W`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['o 1 r2', 'c 1  ', 'c 2 <'])
  expect(events.pov(2).map(_ => _.fen)).toStrictEqual(['o 4 r2', 'c 4  ', 'c 1 <'])
  expect(events.pov(3).map(_ => _.fen)).toStrictEqual(['o 3 r2', 'c 3  ', 'c 4 <'])
  expect(events.pov(4).map(_ => _.fen)).toStrictEqual(['o 2 r2', 'c 2  ', 'c 3 <'])


  let now_povs = [r.pov(1), r.pov(2), r.pov(3), r.pov(4)]

  expect(povs.map((pov, i) => {
    events.pov(i + 1).forEach(event => event.patch_pov(pov))
    return pov.fen
  })).toStrictEqual(now_povs.map(_ => _.fen))


  expect(r.dests.fen).toBe('draw')

  povs = now_povs

  events = r.act('draw')

  now_povs = [r.pov(1), r.pov(2), r.pov(3), r.pov(4)]

  expect(r.fen).toBe(`ra |  r3r4r5r6r7r8r9rtrjrqrkrar2r3Wr2 / >b7r4r5r6r7r8r9rtrjrqrkgag2g3g4W /  g5g6g7g8g9gtgjgqgkgag2g3g4g5W /  g6g7g8g9gtgjgqgkbab2b3b4b5b6W $ b8b9btbjbqbkbab2b3b4b5b6b7b8b9btbjbqbklal2l3l4l5l6l7l8l9ltljlqlklal2l3l4l5l6l7l8l9ltljlqlkffff`)

  expect(events.pov(1).map(_ => _.fen)).toStrictEqual(['d 2', 'c 2 >'])
  expect(events.pov(2).map(_ => _.fen)).toStrictEqual(['d 1 b7', 'c 1 >'])


  expect(povs.map((pov, i) => {
    events.pov(i + 1).forEach(event => event.patch_pov(pov))
    return pov.fen
  })).toStrictEqual(now_povs.map(_ => _.fen))

  expect(r.dests.fen).toBe('out')
})
