/**
 * Быстрое состояние страницы живёт в обычном объекте, а не в React-стейте:
 * его читает useFrame 60 раз в секунду, и перерисовывать из-за него компоненты не нужно.
 */
export const scrollState = {
  /** window.scrollY, px */
  y: 0,
  /** с какой стороны экрана должно быть яблоко: -1 слева, 0 по центру, 1 справа */
  side: 1 as -1 | 0 | 1,
  /** положение курсора, -1..1 */
  px: 0,
  py: 0,
}

export function initScrollState() {
  let raf = 0

  const update = () => {
    raf = 0
    scrollState.y = window.scrollY
    const mid = window.innerHeight / 2
    const sections = document.querySelectorAll<HTMLElement>('[data-side]')
    for (const el of sections) {
      const r = el.getBoundingClientRect()
      if (r.top <= mid && r.bottom > mid) {
        scrollState.side = Number(el.dataset.side) as -1 | 0 | 1
        break
      }
    }
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update)
  }
  const onPointer = (e: PointerEvent) => {
    scrollState.px = (e.clientX / window.innerWidth) * 2 - 1
    scrollState.py = -((e.clientY / window.innerHeight) * 2 - 1)
  }

  update()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  window.addEventListener('pointermove', onPointer, { passive: true })
  return () => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    window.removeEventListener('pointermove', onPointer)
    if (raf) cancelAnimationFrame(raf)
  }
}
