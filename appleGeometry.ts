import { BufferAttribute, BufferGeometry, Color, MathUtils, Shape, ShapeGeometry, SphereGeometry, CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

const { smoothstep, clamp } = MathUtils

export type AppleBody = {
  geometry: BufferGeometry
  /** 0..1 «румянец» для каждой вершины: где у сорта краснота, а где основной цвет */
  mask: Float32Array
  /** 0..1 множитель яркости (крапинки, затемнение у ямок) */
  shade: Float32Array
  /** высота дна верхней ямки, куда садится плодоножка */
  topY: number
}

// Дешёвый детерминированный «шум» без зависимостей.
const noise3 = (x: number, y: number, z: number) =>
  Math.sin(x * 3.1 + 1.3) * Math.sin(y * 4.2 + 0.7) * Math.sin(z * 3.7 + 2.1)
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Яблоко = сфера, которую мы деформируем: плечи шире, низ уже, ямка сверху,
 * маленькая ямка снизу, пять бугорков у основания и лёгкая асимметрия.
 */
export function createAppleBody(segments = 128): AppleBody {
  const sphere = new SphereGeometry(1, segments, segments)
  // Без uv и нормалей вершины на шве склеиваются, и нормали считаются без видимого шва.
  sphere.deleteAttribute('normal')
  sphere.deleteAttribute('uv')
  const geometry = mergeVertices(sphere, 1e-4)
  sphere.dispose()

  const pos = geometry.getAttribute('position') as BufferAttribute
  const count = pos.count
  const mask = new Float32Array(count)
  const shade = new Float32Array(count)

  const Y_SCALE = 0.98
  const TOP_DEPTH = 0.4
  const BOTTOM_LIFT = 0.14

  for (let i = 0; i < count; i++) {
    const x0 = pos.getX(i)
    const y0 = pos.getY(i)
    const z0 = pos.getZ(i)
    const rho0 = Math.hypot(x0, z0)
    const phi = Math.atan2(z0, x0)

    // Радиальный масштаб: сверху шире, к низу сужается.
    let s = 1 + 0.1 * y0 - 0.14 * Math.max(0, -y0) ** 2
    // Пять долек у основания и едва заметные «плечи» сверху.
    const lobes =
      0.045 * Math.cos(5 * phi) * smoothstep(-y0, 0.05, 0.95) +
      0.018 * Math.cos(5 * phi + 0.6) * smoothstep(y0, 0.1, 0.9)
    s *= 1 + lobes + 0.014 * noise3(x0 * 1.5, y0 * 1.5, z0 * 1.5)

    let y = y0 * Y_SCALE
    y -= y0 > 0 ? TOP_DEPTH * Math.exp(-((rho0 / 0.3) ** 2)) : 0
    y += y0 < 0 ? BOTTOM_LIFT * Math.exp(-((rho0 / 0.22) ** 2)) : 0

    pos.setXYZ(i, x0 * s, y, z0 * s)

    // Румянец: с одной стороны гуще, поверх — вертикальные полосы.
    const side = 0.5 + 0.5 * Math.cos(phi - 0.8)
    const streak = 0.5 + 0.5 * Math.sin(phi * 22 + 2.5 * noise3(x0 * 2, y0 * 2, z0 * 2) + y0 * 3)
    const polar = smoothstep(Math.abs(y0), 0.78, 1)
    mask[i] = clamp(side ** 1.1 * (0.6 + 0.4 * streak) * (1 - 0.75 * polar), 0, 1)

    // Яркость: чуть пятнистая, у ямок темнее.
    shade[i] = clamp(0.9 + 0.07 * noise3(x0 * 5, y0 * 5, z0 * 5) + 0.05 * (hash(i) - 0.5) - 0.3 * polar, 0, 1)
  }

  pos.needsUpdate = true
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(count * 3).fill(1), 3))
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()

  return { geometry, mask, shade, topY: Y_SCALE - TOP_DEPTH }
}

const tmp = new Color()

/** Перекрашивает яблоко под сорт: смешивает основной цвет и румянец по маске. */
export function paintApple(body: AppleBody, ground: Color, blush: Color, amount: number) {
  const attr = body.geometry.getAttribute('color') as BufferAttribute
  const arr = attr.array as Float32Array
  for (let i = 0; i < body.mask.length; i++) {
    const t = clamp(body.mask[i] * amount * 1.3, 0, 1)
    tmp.copy(ground).lerp(blush, t)
    const k = body.shade[i]
    arr[i * 3] = tmp.r * k
    arr[i * 3 + 1] = tmp.g * k
    arr[i * 3 + 2] = tmp.b * k
  }
  attr.needsUpdate = true
}

/** Плодоножка: слегка изогнутая трубка, растущая из ямки. */
export function createStemGeometry(topY: number) {
  const curve = new CatmullRomCurve3([
    new Vector3(0, topY - 0.06, 0),
    new Vector3(0.01, topY + 0.1, 0),
    new Vector3(0.05, topY + 0.26, 0.005),
    new Vector3(0.12, topY + 0.34, 0),
  ])
  return new TubeGeometry(curve, 24, 0.028, 8, false)
}

/** Листик: заострённая форма, сложенная вдоль жилки и слегка изогнутая. */
export function createLeafGeometry() {
  const shape = new Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.12, 0.17, 0.4, 0.2, 0.7, 0)
  shape.bezierCurveTo(0.4, -0.2, 0.12, -0.17, 0, 0)
  const geometry = new ShapeGeometry(shape, 16)
  const pos = geometry.getAttribute('position') as BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, 0.35 * x * x + 0.12 * Math.abs(y))
  }
  pos.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}
