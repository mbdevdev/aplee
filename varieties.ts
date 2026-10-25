export type Variety = {
  id: string
  name: string
  where: string
  text: string
  /** основной цвет кожуры */
  ground: string
  /** цвет румянца */
  blush: string
  /** 0..1, сколько румянца */
  blushAmount: number
  /** цвет свечения страницы */
  glow: string
  /** условные оценки вкуса, 1..5 */
  sweet: number
  sour: number
}

export const VARIETIES: Variety[] = [
  {
    id: 'fuji',
    name: 'Фудзи',
    where: 'Япония, выведен в 1930-х, в продаже с 1962 года',
    text: 'Сладкий, сочный и хрустящий. Хорошо хранится, поэтому встречается в магазинах круглый год.',
    ground: '#d8c04e',
    blush: '#b3122a',
    blushAmount: 0.95,
    glow: '#c1272d',
    sweet: 5,
    sour: 2,
  },
  {
    id: 'granny',
    name: 'Гренни Смит',
    where: 'Австралия, 1868 год',
    text: 'Плотный и кислый. Остаётся зелёным, даже когда полностью созрел. Назван в честь Марии Энн Смит, у которой выросла первая яблоня.',
    ground: '#74b52b',
    blush: '#9ac93a',
    blushAmount: 0.25,
    glow: '#6fae2a',
    sweet: 2,
    sour: 5,
  },
  {
    id: 'golden',
    name: 'Голден Делишес',
    where: 'США, начало XX века',
    text: 'Золотистая кожица и мягкий сладкий вкус. Хорош и свежим, и в пирогах.',
    ground: '#e4b82c',
    blush: '#ee8a3a',
    blushAmount: 0.18,
    glow: '#e0a820',
    sweet: 4,
    sour: 2,
  },
  {
    id: 'antonovka',
    name: 'Антоновка',
    where: 'Россия, старинный сорт',
    text: 'Кисловатая и очень ароматная, переносит морозы. Классика для мочёных яблок и пастилы.',
    ground: '#b9c64a',
    blush: '#dfe27a',
    blushAmount: 0.3,
    glow: '#b5c040',
    sweet: 2,
    sour: 4,
  },
]
