export const colors = 'rgbl'.split('')
export const numbers = 'a23456789tjqk'.split('')
export const fake = 'ff'

export type Tas = string

export const taslar = [fake, fake, ...colors.flatMap(color => {
  return [
    ...numbers.map(number => `${color}${number}`),
    ...numbers.map(number => `${color}${number}`)
  ]
})]


export function make_deal(should_shuffle = false) { 
  let res = taslar.slice(0) 

  if (should_shuffle) {
    shuffle(res)
  }

  return res
}

export function tas_split(taslar: string): Tas[] {
  return [...Array(taslar.length / 2).keys()].map(_ => taslar.slice(_ * 2, _ * 2 + 2))
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle<A>(array: A[]) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
