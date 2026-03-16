"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import type { CatalogItem } from "@/lib/data/furniture";
import * as THREE from "three";
import { memo, Suspense, useEffect, useMemo, Component } from "react";

class ModelLoadBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Preview model failed to load. Falling back to built-in preview.", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function PreviewCatalogModel({ item }: { item: CatalogItem }) {
  if (!item.modelUrl) return null;

  const gltf = useGLTF(item.modelUrl);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const targetW = item.width / 100;
  const targetH = item.height / 100;
  const targetD = item.depth / 100;

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const srcMax = Math.max(size.x, size.y, size.z, 0.0001);
    const targetMax = Math.max(targetW, targetD, targetH, 0.0001);
    const fittedScale = (targetMax / srcMax) * (item.modelScale ?? 1);

    return {
      scale: fittedScale,
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
    };
  }, [model, targetW, targetD, targetH, item.modelScale]);

  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;

      if (!child.material) return;
      if (!child.userData.__fvClonedMaterial) {
        child.material = Array.isArray(child.material)
          ? child.material.map((mat) => mat.clone())
          : child.material.clone();
        child.userData.__fvClonedMaterial = true;
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (!(mat instanceof THREE.Material)) return;
        if ("color" in mat && mat.color instanceof THREE.Color) {
          mat.color.set(item.defaultColor);
        }
        mat.needsUpdate = true;
      });
    });
  }, [model, item.defaultColor]);

  return (
    <group scale={scale} position={[offset.x, offset.y, offset.z]}>
      <primitive object={model} />
    </group>
  );
}

function PreviewModel({ item }: { item: CatalogItem }) {
  const w = item.width / 100;
  const h = item.height / 100;
  const d = item.depth / 100;
  const color = new THREE.Color(item.defaultColor);

  const matProps = { color, roughness: 0.5, metalness: 0.05, clearcoat: 0.1, clearcoatRoughness: 0.4 };

  if (item.id === "lamp-floor") {
    return (
      <group>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.04, 32]} />
          <meshPhysicalMaterial color={color} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1.5, 12]} />
          <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <coneGeometry args={[0.18, 0.28, 32]} />
          <meshPhysicalMaterial color="#f5f5dc" roughness={0.6} />
        </mesh>
      </group>
    );
  }

  if (item.id === "lamp-table") {
    return (
      <group>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.04, 24]} />
          <meshPhysicalMaterial color={color} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.3, 12]} />
          <meshPhysicalMaterial color="#c0c0c0" roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.12, 0.16, 32]} />
          <meshPhysicalMaterial color="#f5f5dc" roughness={0.6} />
        </mesh>
      </group>
    );
  }

  if (item.id === "decor-rug") {
    return (
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
    );
  }

  if (item.id === "decor-plant") {
    return (
      <group>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.24, 16]} />
          <meshPhysicalMaterial color="#8B4513" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.7} />
        </mesh>
        <mesh position={[0.08, 0.45, 0.05]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshPhysicalMaterial color={color} roughness={0.7} />
        </mesh>
      </group>
    );
  }

  if (item.id === "shelf-wardrobe") {
    return (
      <group>
        <mesh position={[0, d / 2, 0]}>
          <boxGeometry args={[w, d, h]} />
          <meshPhysicalMaterial {...matProps} roughness={0.6} />
        </mesh>
        <mesh position={[0, d / 2, h / 2 + 0.005]}>
          <boxGeometry args={[0.015, d * 0.85, 0.015]} />
          <meshStandardMaterial color="#111" roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[-w * 0.2, d * 0.5, h / 2 + 0.01]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color="#222" roughness={0.15} metalness={0.7} />
        </mesh>
        <mesh position={[w * 0.2, d * 0.5, h / 2 + 0.01]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial color="#222" roughness={0.15} metalness={0.7} />
        </mesh>
      </group>
    );
  }

  if (item.id === "shelf-bookcase") {
    const shelfCount = Math.max(3, Math.round(d / 0.35));
    return (
      <group>
        <mesh position={[-w / 2 + 0.02, d / 2, 0]}>
          <boxGeometry args={[0.03, d, h]} />
          <meshPhysicalMaterial {...matProps} roughness={0.6} />
        </mesh>
        <mesh position={[w / 2 - 0.02, d / 2, 0]}>
          <boxGeometry args={[0.03, d, h]} />
          <meshPhysicalMaterial {...matProps} roughness={0.6} />
        </mesh>
        {Array.from({ length: shelfCount }).map((_, i) => {
          const y = (i / (shelfCount - 1)) * d;
          return (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[w - 0.02, 0.025, h]} />
              <meshPhysicalMaterial {...matProps} roughness={0.6} />
            </mesh>
          );
        })}
        <mesh position={[0, d / 2, -h / 2 + 0.01]}>
          <boxGeometry args={[w - 0.02, d, 0.015]} />
          <meshPhysicalMaterial {...matProps} roughness={0.6} />
        </mesh>
      </group>
    );
  }

  if (item.id.startsWith("bed-") && !item.id.includes("nightstand")) {
    return (
      <group>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[w, 0.3, h]} />
          <meshPhysicalMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[w * 0.95, 0.15, h * 0.95]} />
          <meshPhysicalMaterial {...matProps} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.55, -h / 2 + 0.04]}>
          <boxGeometry args={[w, 0.6, 0.08]} />
          <meshPhysicalMaterial color="#8B4513" roughness={0.7} />
        </mesh>
      </group>
    );
  }

  if (item.id.startsWith("desk-")) {
    return (
      <group>
        <mesh position={[0, d * 0.9, 0]}>
          <boxGeometry args={[w, 0.04, h]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
        <mesh position={[-w * 0.38, d * 0.45, 0]}>
          <boxGeometry args={[w * 0.22, d * 0.88, h * 0.92]} />
          <meshPhysicalMaterial {...matProps} roughness={0.55} />
        </mesh>
        <mesh position={[w * 0.42, d * 0.45, h * 0.4]}>
          <boxGeometry args={[0.04, d * 0.88, 0.04]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
        <mesh position={[w * 0.42, d * 0.45, -h * 0.4]}>
          <boxGeometry args={[0.04, d * 0.88, 0.04]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  if (item.id === "shelf-tv-stand") {
    return (
      <group>
        <mesh position={[0, d / 2, 0]}>
          <boxGeometry args={[w, d, h]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
        <mesh position={[0, d + 0.01, -h * 0.3]}>
          <boxGeometry args={[w * 0.8, 0.02, 0.02]} />
          <meshStandardMaterial color="#333" roughness={0.2} metalness={0.4} />
        </mesh>
      </group>
    );
  }

  if (item.id === "decor-storage" || item.id === "shelf-display") {
    return (
      <group>
        <mesh position={[0, d / 2, 0]}>
          <boxGeometry args={[w, d, h]} />
          <meshPhysicalMaterial {...matProps} roughness={0.6} />
        </mesh>
        <mesh position={[0, d / 2, h / 2 + 0.005]}>
          <boxGeometry args={[0.015, d * 0.7, 0.015]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
    );
  }

  const isChairLike = d > 0.5 && w < 1;
  const isSofaLike = d > 0.5 && w >= 1;

  if (item.shapeType === "circle") {
    return (
      <group>
        {d > 0.5 &&
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
            <mesh key={i} position={[dx * w * 0.35, 0.15, dz * w * 0.35]} castShadow>
              <cylinderGeometry args={[0.012, 0.018, 0.3, 8]} />
              <meshStandardMaterial color="#222" roughness={0.2} metalness={0.6} />
            </mesh>
          ))}
        <mesh position={[0, d / 2, 0]} castShadow>
          <cylinderGeometry args={[w / 2, w / 2, d * 0.3, 32]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  if (item.shapeType === "ellipse") {
    return (
      <mesh position={[0, d / 2, 0]} castShadow>
        <cylinderGeometry args={[w / 2, w / 2, d * 0.3, 32]} />
        <meshPhysicalMaterial {...matProps} />
      </mesh>
    );
  }

  if (isChairLike) {
    return (
      <group>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
          <mesh key={i} position={[dx * (w / 2 - 0.03), 0.2, dz * (h / 2 - 0.03)]} castShadow>
            <cylinderGeometry args={[0.012, 0.015, 0.4, 8]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.15} metalness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[w * 0.92, 0.05, h * 0.92]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
        <mesh position={[0, 0.72, -h / 2 + 0.025]} castShadow>
          <boxGeometry args={[w * 0.88, 0.55, 0.035]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  if (isSofaLike) {
    const sH = 0.38;
    const armW = 0.09;
    return (
      <group>
        <mesh position={[0, sH / 2 + 0.1, 0.03]} castShadow>
          <boxGeometry args={[w - 0.02, sH, h - 0.02]} />
          <meshPhysicalMaterial {...matProps} roughness={0.75} />
        </mesh>
        <mesh position={[0, sH + 0.25, -h / 2 + 0.08]} castShadow>
          <boxGeometry args={[w - armW * 2 - 0.02, 0.32, 0.13]} />
          <meshPhysicalMaterial {...matProps} roughness={0.8} />
        </mesh>
        <mesh position={[-w / 2 + armW / 2, sH + 0.08, 0.03]} castShadow>
          <boxGeometry args={[armW, 0.22, h * 0.85]} />
          <meshPhysicalMaterial {...matProps} roughness={0.8} />
        </mesh>
        <mesh position={[w / 2 - armW / 2, sH + 0.08, 0.03]} castShadow>
          <boxGeometry args={[armW, 0.22, h * 0.85]} />
          <meshPhysicalMaterial {...matProps} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  if (item.shapeType === "l-shape") {
    return (
      <group>
        <mesh position={[0, d / 2, h * 0.15]} castShadow>
          <boxGeometry args={[w, d, h * 0.5]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
        <mesh position={[-w * 0.3, d / 2, -h * 0.15]} castShadow>
          <boxGeometry args={[w * 0.4, d, h * 0.5]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={[0, d / 2, 0]} castShadow>
      <boxGeometry args={[w, d, h]} />
      <meshPhysicalMaterial {...matProps} />
    </mesh>
  );
}

function FurniturePreview3DInner({ item }: { item: CatalogItem }) {
  const maxDim = Math.max(item.width, item.height, item.depth) / 100;
  const camDist = maxDim * 1.8;

  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.5]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      camera={{
        position: [camDist * 0.7, camDist * 0.6, camDist * 0.8],
        fov: 40,
        near: 0.01,
        far: 50,
      }}
      style={{ width: "100%", height: "100%" }}
    > 
      <color attach="background" args={["#B0664C"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} />
      <directionalLight position={[-2, 3, -1]} intensity={4} color="#ffffff" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={2}
        target={[0, (item.depth / 100) * 0.35, 0]}
      />

      <ModelLoadBoundary fallback={<PreviewModel item={item} />}>
        <Suspense fallback={<PreviewModel item={item} />}>
          {item.modelUrl ? <PreviewCatalogModel item={item} /> : <PreviewModel item={item} />}
        </Suspense>
      </ModelLoadBoundary>
    </Canvas>
  );
}

export const FurniturePreview3D = memo(FurniturePreview3DInner);
