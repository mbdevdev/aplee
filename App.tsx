import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import { VARIETIES } from './lib/varieties'
import { initScrollState } from './scrollState'

const FACTS = [
  {
    title: 'Звезда внутри',
    text: 'Разрежьте яблоко поперёк, а не вдоль: камеры с семечками сложатся в пятиконечную звезду.',
  },
  {
    title: 'Родственница розы',
    text: 'Яблоня входит в то же семейство Розовых, что роза, груша, слива и миндаль.',
  },
  {
    title: 'Яблоко Ньютона',
    text: 'Сам Ньютон рассказывал, что мысль о тяготении пришла к нему при виде падающего яблока. А вот «яблоко по голове» — скорее красивая легенда.',
  },
  {
    title: 'Нужны соседи',
    text: 'Большинству сортов требуется пыльца другого сорта, которую переносят пчёлы. Поэтому в садах сорта чередуют.',
  },
  {
    title: 'Ускоритель созревания',
    text: 'Яблоки выделяют этилен — газ, который ускоряет созревание. Положите яблоко в пакет к твёрдым авокадо или бананам, и они дозреют быстрее.',
  },
  {
    title: 'Осторожно, семечки',
    text: 'В семенах есть амигдалин, из которого при разжёвывании может образоваться синильная кислота. Пара случайно проглоченных семечек безопасна, а горсть разжёванных ни к чему.',
  },
]

const STATS = [
  { value: '≈ 52', unit: 'ккал', label: 'в 100 г яблока' },
  { value: '≈ 86', unit: '%', label: 'вода' },
  { value: '≈ 2,4', unit: 'г', label: 'клетчатки на 100 г' },
  { value: '≈ 25', unit: '%', label: 'объёма — воздух, поэтому яблоко плавает' },
]

export default function App() {
  const [varietyId, setVarietyId] = useState(VARIETIES[0].id)
  const variety = VARIETIES.find((v) => v.id === varietyId) ?? VARIETIES[0]

  useEffect(() => initScrollState(), [])
  useEffect(() => {
    document.documentElement.style.setProperty('--glow', variety.glow)
  }, [variety])

  return (
    <>
      {/* Холст лежит под страницей и не перехватывает ни касания, ни прокрутку. */}
      <div className="stage" aria-hidden="true">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6], fov: 40 }}
          fallback={<div className="fallback">🍎</div>}>
          <Scene variety={variety} />
        </Canvas>
      </div>

      <header className="topbar">
        <a className="brand" href="#top">
          <span aria-hidden="true">🍎</span> Яблоко
        </a>
        <nav aria-label="Разделы">
          <a href="#origin">Происхождение</a>
          <a href="#varieties">Сорта</a>
          <a href="#inside">Состав</a>
          <a href="#facts">Факты</a>
        </nav>
      </header>

      <main>
        <section id="top" className="section" data-side="1">
          <div className="card hero">
            <p className="eyebrow">Malus domestica</p>
            <h1>Яблоко</h1>
            <p className="lead">
              Самый привычный фрукт на свете и одна из самых длинных историй в садоводстве. Листайте страницу, и яблоко будет
              поворачиваться.
            </p>
            <a className="button" href="#origin">
              Начать ↓
            </a>
          </div>
        </section>

        <section id="origin" className="section" data-side="-1">
          <div className="card">
            <p className="eyebrow">01 · Происхождение</p>
            <h2>Откуда оно взялось</h2>
            <p>
              Предок культурной яблони, дикая яблоня Сиверса (<i>Malus sieversii</i>), до сих пор растёт в горных лесах Тянь-Шаня на
              юго-востоке Казахстана. Название города Алматы часто связывают со словом «алма», то есть «яблоко».
            </p>
            <ol className="timeline">
              <li>
                <b>Тянь-Шань</b>
                <span>родина дикого предка</span>
              </li>
              <li>
                <b>Торговые пути</b>
                <span>вместе с караванами яблоки уходят на запад и восток и скрещиваются с местными дикими яблонями</span>
              </li>
              <li>
                <b>Сегодня</b>
                <span>сады на всех континентах, кроме Антарктиды; больше половины мирового урожая даёт Китай (около 45–50 млн т в год по оценкам FAO и USDA)</span>
              </li>
            </ol>
          </div>
        </section>

        <section id="varieties" className="section" data-side="1">
          <div className="card">
            <p className="eyebrow">02 · Сорта</p>
            <h2>Одно яблоко, тысячи вкусов</h2>
            <p>Сортов не пересчитать: по разным оценкам, их от 6 до 7,5 тысяч. Выберите сорт, и яблоко перекрасится.</p>

            <div className="chips" role="group" aria-label="Сорт яблока">
              {VARIETIES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className="chip"
                  aria-pressed={v.id === varietyId}
                  onClick={() => setVarietyId(v.id)}>
                  <span className="dot" style={{ background: v.blushAmount > 0.5 ? v.blush : v.ground }} aria-hidden="true" />
                  {v.name}
                </button>
              ))}
            </div>

            <div className="variety" aria-live="polite">
              <h3>{variety.name}</h3>
              <p className="where">{variety.where}</p>
              <p>{variety.text}</p>
              <dl className="meters">
                <div>
                  <dt>Сладость</dt>
                  <dd className="meter" role="img" aria-label={`${variety.sweet} из 5`}>
                    <span style={{ width: `${variety.sweet * 20}%` }} />
                  </dd>
                </div>
                <div>
                  <dt>Кислинка</dt>
                  <dd className="meter" role="img" aria-label={`${variety.sour} из 5`}>
                    <span style={{ width: `${variety.sour * 20}%` }} />
                  </dd>
                </div>
              </dl>
              <p className="note">Оценки вкуса условные: у разных садов и в разные годы яблоки отличаются.</p>
            </div>
          </div>
        </section>

        <section id="inside" className="section" data-side="-1">
          <div className="card">
            <p className="eyebrow">03 · Состав</p>
            <h2>Что внутри</h2>
            <p>
              В основном вода и клетчатка, в том числе пектин. Заметная часть антиоксидантных полифенолов сосредоточена в кожуре,
              поэтому яблоки полезно есть вместе с ней.
            </p>
            <div className="stats">
              {STATS.map((s) => (
                <div key={s.label} className="stat">
                  <div className="stat-value">
                    {s.value}
                    <small>{s.unit}</small>
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="note">Средние значения для сырого яблока с кожурой, на 100 г (по данным USDA FoodData Central). У разных сортов они отличаются.</p>
          </div>
        </section>

        <section id="facts" className="section" data-side="1">
          <div className="card facts">
            <p className="eyebrow">04 · Факты</p>
            <h2>Шесть мелочей про яблоко</h2>
            <div className="fact-grid">
              {FACTS.map((f) => (
                <article key={f.title} className="fact">
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="end" className="section end" data-side="0">
          <div className="card center">
            <h2>Вот и всё</h2>
            <p>
              Это яблоко построено кодом: ни одного 3D-файла, только форма из сферы, немного математики и цвета сортов. Сайт сделан на{' '}
              <a href="https://docs.pmnd.rs/react-three-fiber" target="_blank" rel="noreferrer">
                React Three Fiber
              </a>
              .
            </p>
            <a className="button" href="#top">
              ↑ Наверх
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
