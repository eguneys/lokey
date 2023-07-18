import { Tas } from './deal'

export function valid_color(taslar: Tas[]) {
  let a = taslar.every(_ => _[1] === taslar[0][1])
  let b = new Set(taslar.map(_ => _[0])).size === taslar.length

  return a && b
}

export function valid_seri(taslar: Tas[]) {
  return true
}

export function valid_number(taslar: Tas[]) {
  return taslar.length >= 3
}

export function valid_board(groups: Tas[][]) {
  return groups.every(_ => valid_number(_) && (valid_seri(_) || valid_color(_)))
}
