// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import type { BufferAttribute, Group, Mesh } from 'three'
import Apple from '../src/Apple'
import { createAppleBody, createLeafGeometry, createStemGeometry } from '../src/lib/appleGeometry'
import { scrollState } from '../src/lib/scrollState'
import { VARIETIES } from '../src/lib/varieties'
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('геометрия яблока', () => {
  const body = createAppleBody(64)
  const pos = body.geometry.getAttribute('position') as BufferAttribute
  const normal = body.geometry.getAttribute('normal') as BufferAttribute

  test('нет NaN ни в позициях, ни в нормалях', () => {
    expect([...pos.array].every(Number.isFinite)).toBe(true)
    expect([...normal.array].every(Number.isFinite)).toBe(true)
  })

  test('пропорции похожи на яблоко: чуть шире, чем выше', () => {
    const bb = body.geometry.boundingBox!
    const width = bb.max.x - bb.min.x
    const height = bb.max.y - bb.min.y
    expect(width / height).toBeGreaterThan(1.05)
    expect(width / height).toBeLessThan(1.35)
  })

  test('верхняя ямка: полюс ниже плеч, а плодоножка растёт из дна ямки', () => {
    let shoulder = -Infinity
    for (let i = 0; i < pos.count; i++) shoulder = Math.max(shoulder, pos.getY(i))
    expect(body.topY).toBeLessThan(shoulder - 0.15)
    const stem = createStemGeometry(body.topY)
    stem.computeBoundingBox()
    expect(stem.boundingBox!.min.y).toBeLessThan(body.topY)
    expect(stem.boundingBox!.max.y).toBeGreaterThan(shoulder)
  })

  test('маска, яркость и нормали в допустимых пределах', () => {
    expect(Math.min(...body.mask)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...body.mask)).toBeLessThanOrEqual(1)
    expect(Math.min(...body.shade)).toBeGreaterThan(0.4)
    expect(createLeafGeometry().getAttribute('position').count).toBeGreaterThan(10)
  })
})

describe('компонент Apple', () => {
  const frames = 120
  const dt = 1 / 60

  test('появляется, смещается в сторону раздела и вращается от прокрутки', async () => {
    scrollState.side = -1
    scrollState.y = 1000
    const renderer = await ReactThreeTestRenderer.create(<Apple variety={VARIETIES[0]} />, { width: 1280, height: 720 })
    const group = renderer.scene.children[0].instance as Group
    expect(group.scale.x).toBeLessThan(0.01)

    await renderer.advanceFrames(frames, dt)
    expect(group.scale.x).toBeGreaterThan(0.5)
    expect(group.position.x).toBeLessThan(-0.5)
    expect(group.rotation.y).toBeGreaterThan(1)

    scrollState.side = 1
    await renderer.advanceFrames(frames * 2, dt)
    expect(group.position.x).toBeGreaterThan(0.5)
    await renderer.unmount()
  })

  test('на узком экране яблоко по центру и меньше', async () => {
    scrollState.side = 1
    const renderer = await ReactThreeTestRenderer.create(<Apple variety={VARIETIES[0]} />, { width: 390, height: 800 })
    const group = renderer.scene.children[0].instance as Group
    await renderer.advanceFrames(frames * 2, dt)
    expect(Math.abs(group.position.x)).toBeLessThan(0.2)
    await renderer.unmount()
  })

  test('при смене сорта вершины плавно перекрашиваются', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Apple variety={VARIETIES[0]} />, { width: 1280, height: 720 })
    const mesh = renderer.scene.children[0].children[0].instance as Mesh
    const color = mesh.geometry.getAttribute('color') as BufferAttribute
    await renderer.advanceFrames(frames, dt)
    const redBefore = color.getX(100)
    const greenBefore = color.getY(100)

    await renderer.update(<Apple variety={VARIETIES[1]} />)
    await renderer.advanceFrames(frames * 2, dt)
    // Фудзи красноватое, Гренни Смит зелёное: доля зелёного должна вырасти.
    expect(color.getY(100) / color.getX(100)).toBeGreaterThan(greenBefore / redBefore)
    await renderer.unmount()
  })
})
