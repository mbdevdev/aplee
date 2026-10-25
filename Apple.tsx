import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide, MathUtils, type Group, type Mesh } from 'three'
import { createAppleBody, createLeafGeometry, createStemGeometry, paintApple } from './appleGeometry'
import { scrollState } from './scrollState'
import type { Variety } from './varieties'

const { damp } = MathUtils

export default function Apple({ variety }: { variety: Variety }) {
  const group = useRef<Group>(null)
  const leaf = useRef<Mesh>(null)

  // Геометрию строим один раз и освобождаем при размонтировании.
  const body = useMemo(() => createAppleBody(128), [])
  const stem = useMemo(() => createStemGeometry(body.topY), [body.topY])
  const leafGeo = useMemo(() => createLeafGeometry(), [])
  useEffect(
    () => () => {
      body.geometry.dispose()
      stem.dispose()
      leafGeo.dispose()
    },
    [body, stem, leafGeo],
  )

  const reduced = useMemo(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  // Цвета, к которым плавно тянется яблоко, и текущие (меняются каждый кадр).
  const target = useMemo(
    () => ({ ground: new Color(variety.ground), blush: new Color(variety.blush), amount: variety.blushAmount }),
    [variety],
  )
  const paint = useRef({ ground: new Color(variety.ground), blush: new Color(variety.blush), amount: variety.blushAmount })
  const settled = useRef(false)

  useLayoutEffect(() => {
    const p = paint.current
    paintApple(body, p.ground, p.blush, p.amount)
  }, [body])

  // Короткий «пульс» при смене сорта.
  const pulse = useRef(0)
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    pulse.current = 1
    settled.current = false
  }, [variety])

  const time = useRef(0)
  const spin = useRef(0)
  const idle = useRef(0)
  const intro = useRef(0)

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(delta, 0.05)
    time.current += dt

    const { viewport, size } = state
    const narrow = size.width < 640 || size.width / size.height < 0.85
    const side = narrow ? 0 : scrollState.side

    // Позиция и размер зависят от экрана и от того, какой раздел сейчас читают.
    const tx = side * viewport.width * 0.2 + scrollState.px * 0.12
    const ty = (narrow ? viewport.height * 0.2 : 0) + Math.sin(time.current * 1.1) * 0.05
    const base = narrow ? Math.min(1, viewport.width * 0.28) : Math.min(1.5, viewport.height * 0.32)

    g.position.x = damp(g.position.x, tx, 3, dt)
    g.position.y = damp(g.position.y, ty, 3, dt)

    intro.current = damp(intro.current, 1, 2.5, dt)
    pulse.current = damp(pulse.current, 0, 6, dt)
    g.scale.setScalar(base * intro.current * (1 + 0.1 * pulse.current))

    // Вращение: от прокрутки страницы плюс медленное собственное.
    spin.current = damp(spin.current, scrollState.y * 0.0042, 4, dt)
    idle.current += reduced ? 0 : dt * 0.35
    g.rotation.y = spin.current + idle.current
    g.rotation.x = damp(g.rotation.x, 0.28 - scrollState.py * 0.18, 3, dt)

    if (leaf.current && !reduced) leaf.current.rotation.z = 0.55 + Math.sin(time.current * 1.6) * 0.04

    // Плавная смена цвета: перекрашиваем вершины, пока цвета не сошлись.
    const p = paint.current
    const k = 1 - Math.exp(-dt * 5)
    p.ground.lerp(target.ground, k)
    p.blush.lerp(target.blush, k)
    p.amount += (target.amount - p.amount) * k
    const diff =
      Math.abs(p.ground.r - target.ground.r) + Math.abs(p.ground.g - target.ground.g) + Math.abs(p.ground.b - target.ground.b) +
      Math.abs(p.blush.r - target.blush.r) + Math.abs(p.blush.g - target.blush.g) + Math.abs(p.blush.b - target.blush.b) +
      Math.abs(p.amount - target.amount)
    if (diff > 0.002) {
      paintApple(body, p.ground, p.blush, p.amount)
      settled.current = false
    } else if (!settled.current) {
      p.ground.copy(target.ground)
      p.blush.copy(target.blush)
      p.amount = target.amount
      paintApple(body, p.ground, p.blush, p.amount)
      settled.current = true
    }
  })

  return (
    <group ref={group} scale={0.001}>
      <mesh geometry={body.geometry}>
        <meshPhysicalMaterial vertexColors roughness={0.38} clearcoat={0.55} clearcoatRoughness={0.3} />
      </mesh>
      <mesh geometry={stem}>
        <meshStandardMaterial color="#4a3322" roughness={0.9} />
      </mesh>
      <mesh ref={leaf} geometry={leafGeo} position={[0.05, body.topY + 0.17, 0]} rotation={[0, -0.5, 0.55]}>
        <meshStandardMaterial color="#4f8f2d" roughness={0.6} side={DoubleSide} />
      </mesh>
    </group>
  )
}
