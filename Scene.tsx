import { Environment, Lightformer } from '@react-three/drei'
import Apple from './Apple'
import type { Variety } from './lib/varieties'

export default function Scene({ variety }: { variety: Variety }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff1e0" />
      <directionalLight position={[-4, 1, -3]} intensity={1.2} color="#8fb4ff" />

      {/* Освещение «фотостудии» собрано из световых панелей: картинок и сетевых запросов не нужно. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -5]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 2]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[5, -1, 3]} scale={[4, 4, 1]} />
      </Environment>

      <Apple variety={variety} />
    </>
  )
}
