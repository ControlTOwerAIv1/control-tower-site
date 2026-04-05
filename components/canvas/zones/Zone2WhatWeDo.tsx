'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import VolumetricCone from '@/components/canvas/shared/VolumetricCone'
import { useScrollStore } from '@/store/scroll'
import { getZoneProgress, getZoneVisibility } from '@/lib/zones'

type CityBlock = {
  x: number
  z: number
  w: number
  d: number
  h: number
  accent: string
}

const TOWER_LINK_TARGET: [number, number, number] = [0, 10.9, 0]

export default function Zone2WhatWeDo() {
  const haloRef = useRef<THREE.Mesh>(null)
  const beaconRef = useRef<THREE.Mesh>(null)
  const windowRefs = useRef<Array<THREE.Mesh | null>>([])
  const cityBeaconRefs = useRef<Array<THREE.Mesh | null>>([])
  const packetRefs = useRef<Array<THREE.Mesh | null>>([])
  const beamAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const beamDirection = useMemo(() => new THREE.Vector3(), [])
  const whatWeDoRef = useRef<THREE.Group>(null)
  const whatWeDoBarsRef = useRef<Array<THREE.Mesh | null>>([])
  const progress = useScrollStore((state) => state.progress)

  const cityBlocks = useMemo<CityBlock[]>(() => {
    const blocks: CityBlock[] = []
    const accents = ['#00c8ff', '#00ff88', '#ffa000'] as const

    for (let xi = -7; xi <= 7; xi++) {
      for (let zi = -7; zi <= 7; zi++) {
        const x = xi * 12.2
        const z = zi * 12.2
        const dist = Math.hypot(x, z)
        if (dist < 14) continue

        const hSeed = (Math.sin(x * 0.11 + z * 0.07) + Math.cos(x * 0.05 - z * 0.09) + 2) / 4
        const sSeed = (Math.sin(x * 0.17) + Math.cos(z * 0.13) + 2) / 4

        blocks.push({
          x,
          z,
          w: 2.8 + sSeed * 2.6,
          d: 2.8 + (1 - sSeed) * 2.6,
          h: 2.8 + hSeed * 10.8,
          accent: accents[Math.floor(((hSeed + sSeed) * 10) % accents.length)],
        })
      }
    }

    return blocks
  }, [])

  const commBlocks = useMemo(() => cityBlocks.filter((_, i) => i % 3 === 0), [cityBlocks])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const visibility = getZoneVisibility(progress, 2)
    const reveal = getZoneProgress(progress, 2)

    if (haloRef.current) {
      haloRef.current.rotation.x = Math.PI / 2
      haloRef.current.rotation.z = t * 0.9
    }

    if (beaconRef.current) {
      const pulse = 0.9 + Math.sin(t * 3.2) * 0.18
      beaconRef.current.scale.setScalar(pulse)
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.1 + Math.sin(t * 4) * 0.35
    }

    windowRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.38 + Math.sin(t * 2.1 + i * 0.22) * 0.24
    })

    cityBeaconRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.35 + Math.sin(t * 2.8 + i * 0.35) * 0.38
    })

    packetRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const sourceIndex = Math.floor(i / 2) % commBlocks.length
      const source = commBlocks[sourceIndex]
      const buildingX = source.x
      const buildingY = source.h + 0.58
      const buildingZ = source.z
      const isUplink = i % 2 === 0
      const fromX = isUplink ? buildingX : TOWER_LINK_TARGET[0]
      const fromY = isUplink ? buildingY : TOWER_LINK_TARGET[1]
      const fromZ = isUplink ? buildingZ : TOWER_LINK_TARGET[2]
      const toX = isUplink ? TOWER_LINK_TARGET[0] : buildingX
      const toY = isUplink ? TOWER_LINK_TARGET[1] : buildingY
      const toZ = isUplink ? TOWER_LINK_TARGET[2] : buildingZ
      const travel = (t * 0.24 + sourceIndex * 0.12 + (isUplink ? 0 : 0.5)) % 1

      mesh.position.set(
        fromX + (toX - fromX) * travel,
        fromY + (toY - fromY) * travel,
        fromZ + (toZ - fromZ) * travel,
      )

      beamDirection.set(toX - fromX, toY - fromY, toZ - fromZ).normalize()
      mesh.quaternion.setFromUnitVectors(beamAxis, beamDirection)

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.85 + Math.sin(t * 4.2 + i * 0.2) * 0.28
      mat.opacity = 0.56 + Math.sin(t * 4.9 + i * 0.3) * 0.18
    })

    if (whatWeDoRef.current) {
      const targetY = -2.1 + reveal * 3.2
      const targetScale = 0.52 + visibility * 0.48
      whatWeDoRef.current.position.x = THREE.MathUtils.lerp(whatWeDoRef.current.position.x, -6.1, 0.08)
      whatWeDoRef.current.position.y = THREE.MathUtils.lerp(whatWeDoRef.current.position.y, targetY, 0.12)
      whatWeDoRef.current.position.z = THREE.MathUtils.lerp(whatWeDoRef.current.position.z, 3.45, 0.08)
      const nextScale = THREE.MathUtils.lerp(whatWeDoRef.current.scale.x, targetScale, 0.12)
      whatWeDoRef.current.scale.setScalar(nextScale)
      whatWeDoRef.current.visible = visibility > 0.02

      whatWeDoRef.current.traverse((child) => {
        const material = (child as THREE.Mesh).material
        if (!material) return

        const applyOpacity = (mat: THREE.Material) => {
          const baseOpacity = typeof mat.userData.baseOpacity === 'number' ? mat.userData.baseOpacity : mat.opacity
          if (typeof mat.userData.baseOpacity !== 'number') {
            mat.userData.baseOpacity = baseOpacity
          }
          mat.transparent = true
          mat.opacity = baseOpacity * visibility
        }

        if (Array.isArray(material)) {
          material.forEach(applyOpacity)
        } else {
          applyOpacity(material)
        }
      })
    }

    whatWeDoBarsRef.current.forEach((bar, i) => {
      if (!bar) return

      const wave = 0.5 + ((Math.sin(t * 2.2 + i * 0.45) + 1) / 2) * 0.95
      bar.scale.y = wave
      bar.position.y = 1.25 + (bar.userData.baseHeight * (wave - 1)) / 2

      const mat = bar.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = (0.2 + i * 0.02) * visibility
    })
  })

  return (
    <group position={[0, 0, 2]}>
      <VolumetricCone position={[0, 15.6, 0]} height={6.8} radius={1.25} color="#8de7ff" opacity={0.18} pulseSpeed={1.4} />
      <VolumetricCone position={[0, 14.9, 0]} rotation={[Math.PI, 0, 0]} height={4.8} radius={1.05} color="#5fd1ff" opacity={0.11} pulseSpeed={1.2} />

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[15, 124, 120]} />
        <meshStandardMaterial color="#06111f" roughness={0.42} metalness={0.2} transparent opacity={0.82} />
      </mesh>

      {cityBlocks.map((b, i) => (
        <group key={`business-${i}`} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color="#102338" emissive="#00c8ff" emissiveIntensity={0.08} metalness={0.55} roughness={0.28} />
          </mesh>

          <mesh position={[0, b.h + 0.12, 0]}>
            <boxGeometry args={[b.w * 0.84, 0.24, b.d * 0.84]} />
            <meshStandardMaterial color="#264765" emissive="#00c8ff" emissiveIntensity={0.14} metalness={0.62} roughness={0.18} />
          </mesh>

          <mesh
            position={[0, b.h + 0.34, 0]}
            ref={(el) => {
              cityBeaconRefs.current[i] = el
            }}
          >
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color={b.accent} emissive={b.accent} emissiveIntensity={0.5} />
          </mesh>

          <mesh position={[0, b.h * 0.62, b.d / 2 + 0.02]}>
            <boxGeometry args={[b.w * 0.62, 0.14, 0.03]} />
            <meshStandardMaterial color="#88dfff" emissive="#00c8ff" emissiveIntensity={0.35} transparent opacity={0.6} />
          </mesh>

          <mesh position={[0, b.h * 0.3, -b.d / 2 - 0.02]}>
            <boxGeometry args={[b.w * 0.54, 0.12, 0.03]} />
            <meshStandardMaterial color="#88dfff" emissive="#00c8ff" emissiveIntensity={0.28} transparent opacity={0.45} />
          </mesh>
        </group>
      ))}

      {new Array(commBlocks.length * 2).fill(0).map((_, i) => (
        <mesh
          key={`packet-${i}`}
          position={[0, 0, 0]}
          ref={(el) => {
            packetRefs.current[i] = el
          }}
        >
          <cylinderGeometry args={[0.05, 0.08, 0.95, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#b1f0ff' : '#90ffd6'}
            emissive="#00c8ff"
            emissiveIntensity={1.05}
            transparent
            opacity={0.68}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[5, 5, 0.9, 10]} />
        <meshStandardMaterial color="#090f19" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.96, 0]}>
        <cylinderGeometry args={[4.85, 5.02, 0.22, 10]} />
        <meshStandardMaterial color="#13253b" emissive="#00c8ff" emissiveIntensity={0.1} metalness={0.72} roughness={0.26} />
      </mesh>

      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[3.5, 4.1, 2.8, 10]} />
        <meshStandardMaterial color="#0c1625" emissive="#00c8ff" emissiveIntensity={0.05} metalness={0.72} roughness={0.35} />
      </mesh>


      {/* Taller control tower: increase Y height of main shaft and cone */}
      <mesh position={[0, 6.8, 0]}>
        <cylinderGeometry args={[2.35, 2.9, 12.5, 10]} />
        <meshStandardMaterial color="#102033" emissive="#00c8ff" emissiveIntensity={0.1} metalness={0.75} roughness={0.24} />
      </mesh>

      <mesh position={[0, 12.55, 0]}>
        <cylinderGeometry args={[2.95, 2.4, 1.6, 10]} />
        <meshStandardMaterial color="#1a2f4a" emissive="#00c8ff" emissiveIntensity={0.2} metalness={0.65} roughness={0.2} />
      </mesh>

      <mesh position={[0, 13.7, 0]}>
        <cylinderGeometry args={[2.72, 2.72, 0.5, 10]} />
        <meshStandardMaterial color="#6ed6ff" emissive="#00c8ff" emissiveIntensity={0.85} metalness={0.2} roughness={0.16} transparent opacity={0.78} />
      </mesh>

      <mesh position={[0, 14.85, 0]}>
        <coneGeometry args={[1.62, 3.8, 10]} />
        <meshStandardMaterial color="#1c3657" emissive="#00c8ff" emissiveIntensity={0.25} metalness={0.62} roughness={0.18} />
      </mesh>
      <mesh position={[0, 16.05, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 0.35, 10]} />
        <meshStandardMaterial color="#173252" emissive="#00c8ff" emissiveIntensity={0.25} metalness={0.6} roughness={0.16} />
      </mesh>

      <mesh position={[0, 14.15, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.8, 6]} />
        <meshStandardMaterial color="#74dbff" emissive="#00c8ff" emissiveIntensity={0.92} metalness={0.28} roughness={0.15} />
      </mesh>

      <mesh ref={beaconRef} position={[0, 15.12, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#7be1ff" emissive="#00c8ff" emissiveIntensity={1.2} />
      </mesh>

      {[
        [2.15, 6.1, 0],
        [-2.15, 6.1, 0],
        [0, 6.1, 2.15],
        [0, 6.1, -2.15],
      ].map((position, i) => (
        <mesh key={`buttress-${i}`} position={position as [number, number, number]} rotation={[0, i < 2 ? Math.PI / 2 : 0, 0]}>
          <boxGeometry args={[0.3, 7.2, 0.82]} />
          <meshStandardMaterial color="#1a314f" emissive="#00c8ff" emissiveIntensity={0.17} metalness={0.78} roughness={0.2} />
        </mesh>
      ))}

      {new Array(13).fill(0).map((_, row) => {
        const y = 2.55 + row * 0.62
        return new Array(10).fill(0).map((__, face) => {
          const rot = (face / 10) * Math.PI * 2
          const index = row * 10 + face
          return (
            <mesh
              key={`win-${row}-${face}`}
              position={[Math.cos(rot) * 2.42, y, Math.sin(rot) * 2.42]}
              rotation={[0, rot, 0]}
              ref={(el) => {
                windowRefs.current[index] = el
              }}
            >
              <boxGeometry args={[0.52, 0.16, 0.05]} />
              <meshStandardMaterial color="#7ddcff" emissive="#00c8ff" emissiveIntensity={0.45} metalness={0.14} roughness={0.1} />
            </mesh>
          )
        })
      })}

      <mesh ref={haloRef} position={[0, 12.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.95, 0.05, 12, 64]} />
        <meshStandardMaterial color="#39c9ff" emissive="#00c8ff" emissiveIntensity={0.7} />
      </mesh>

      <group ref={whatWeDoRef} position={[-6.1, -2.1, 3.45]} scale={0.52}>
        <mesh position={[0, 2.4, -0.3]}>
          <boxGeometry args={[3.9, 2.45, 0.14]} />
          <meshStandardMaterial color="#0e1f34" emissive="#00c8ff" emissiveIntensity={0.18} metalness={0.55} roughness={0.2} />
        </mesh>

        <mesh position={[0, 2.4, -0.2]}>
          <boxGeometry args={[3.25, 2, 0.02]} />
          <meshStandardMaterial color="#7fdfff" emissive="#00c8ff" emissiveIntensity={0.3} transparent opacity={0.2} />
        </mesh>

        {new Array(10).fill(0).map((_, i) => {
          const baseHeight = 0.3 + (i % 4) * 0.12
          return (
            <mesh
              key={`what-we-do-bar-${i}`}
              position={[-1.42 + i * 0.32, 1.25, -0.18]}
              ref={(el) => {
                whatWeDoBarsRef.current[i] = el
                if (el) {
                  el.userData.baseHeight = baseHeight
                }
              }}
            >
              <boxGeometry args={[0.16, baseHeight, 0.02]} />
              <meshStandardMaterial color="#95e8ff" emissive="#00c8ff" emissiveIntensity={0.45} transparent opacity={0.85} />
            </mesh>
          )
        })}

        <mesh position={[0, 1.05, 0.42]}>
          <boxGeometry args={[2.8, 0.18, 1.05]} />
          <meshStandardMaterial color="#12263d" metalness={0.6} roughness={0.22} />
        </mesh>

        <mesh position={[0, 1.46, 0.95]}>
          <boxGeometry args={[0.58, 0.74, 0.4]} />
          <meshStandardMaterial color="#1f3a58" emissive="#00c8ff" emissiveIntensity={0.2} />
        </mesh>

        <mesh position={[0, 2.08, 0.95]}>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshStandardMaterial color="#5ec7ff" emissive="#00c8ff" emissiveIntensity={0.45} />
        </mesh>
      </group>
    </group>
  )
}
