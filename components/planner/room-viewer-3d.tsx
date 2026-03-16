"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    OrbitControls,
    PerspectiveCamera,
    ContactShadows,
    Environment,
    MeshReflectorMaterial,
    TransformControls,
    Line,
    useGLTF,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, N8AO } from "@react-three/postprocessing";
import { useDesignStore } from "@/lib/stores/design-store";
import type { FurnitureItem } from "@/lib/stores/design-store";
import * as THREE from "three";
import { useRef, useCallback, memo, useEffect, useMemo, useState, Suspense, Component } from "react";
import { FURNITURE_CATALOG } from "@/lib/data/furniture";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

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
        console.warn("Custom model failed to load. Falling back to built-in geometry.", error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

function hexToColor(hex: string): THREE.Color {
    return new THREE.Color(hex);
}

function clamp(value: number, min: number, max: number) {
    if (min > max) {
        return (min + max) / 2;
    }
    return Math.max(min, Math.min(max, value));
}

type RoomState = ReturnType<typeof useDesignStore.getState>["room"];
type Vector3State = { x: number; y: number; z: number };

function hasVector3StateChanged(current: Vector3State, next: Vector3State, epsilon = 0.001) {
    return (
        Math.abs(current.x - next.x) > epsilon ||
        Math.abs(current.y - next.y) > epsilon ||
        Math.abs(current.z - next.z) > epsilon
    );
}

function clampWalkCameraPosition(position: Vector3State, room: RoomState): Vector3State {
    const minX = -room.width / 200 + 0.2;
    const maxX = room.width / 200 - 0.2;
    const minZ = -room.height / 200 + 0.2;
    const maxZ = room.height / 200 - 0.2;
    const minY = 0.3;
    const maxY = room.wallHeight / 100 - 0.2;

    return {
        x: clamp(position.x, minX, maxX),
        y: clamp(position.y, minY, maxY),
        z: clamp(position.z, minZ, maxZ),
    };
}

function clampOrbitTarget(position: Vector3State, room: RoomState): Vector3State {
    const minX = -room.width / 200 + 0.1;
    const maxX = room.width / 200 - 0.1;
    const minZ = -room.height / 200 + 0.1;
    const maxZ = room.height / 200 - 0.1;
    const minY = 0.1;
    const maxY = room.wallHeight / 100 - 0.1;

    return {
        x: clamp(position.x, minX, maxX),
        y: clamp(position.y, minY, maxY),
        z: clamp(position.z, minZ, maxZ),
    };
}

function getRotatedHalfExtents(width: number, height: number, rotationRadians: number) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const cos = Math.abs(Math.cos(rotationRadians));
    const sin = Math.abs(Math.sin(rotationRadians));

    return {
        x: halfWidth * cos + halfHeight * sin,
        z: halfWidth * sin + halfHeight * cos,
    };
}

function GradientBackground({ profile }: { profile: "default" | "cozy" }) {
    const shaderRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => {
        const isCozy = profile === "cozy";
        return {
            uTime: { value: 0 },
            uTop: { value: new THREE.Color(isCozy ? "#2f2318" : "#0f1017") },
            uBottom: { value: new THREE.Color(isCozy ? "#110d09" : "#040507") },
            uGlow: { value: new THREE.Color(isCozy ? "#a66a40" : "#1b1c2f") },
            uGlowStrength: { value: isCozy ? 0.24 : 0.14 },
            uGrainStrength: { value: isCozy ? 0.035 : 0.015 },
        };
    }, [profile]);

    useFrame((state) => {
        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh position={[0, 0, -20]} scale={[60, 60, 1]}>
            <planeGeometry />
            <shaderMaterial
                ref={shaderRef}
                uniforms={uniforms}
                vertexShader={`
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
                fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uTop;
          uniform vec3 uBottom;
          uniform vec3 uGlow;
          uniform float uGlowStrength;
          uniform float uGrainStrength;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            float g = smoothstep(0.0, 1.0, vUv.y);
            vec2 uv = vUv + vec2(0.0, uTime * 0.01);
            float grain = (hash(uv * vec2(600.0, 340.0)) - 0.5) * uGrainStrength;
            float glow = 1.0 - smoothstep(0.15, 0.95, length(vUv - vec2(0.5, 0.35)) * 1.25);
            vec3 base = mix(uBottom, uTop, g);
            vec3 color = base + (uGlow * glow * uGlowStrength) + grain;
            gl_FragColor = vec4(color, 1.0);
          }
        `}
                side={THREE.DoubleSide}
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
}


function FirstPersonControls() {
    const { camera } = useThree();
    const { room, walkCameraPosition3d } = useDesignStore();
    const [moveState, setMoveState] = useState({ forward: false, backward: false, left: false, right: false, up: false, down: false });
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const initializedRef = useRef(false);


    useEffect(() => {
        const nextPosition = clampWalkCameraPosition(walkCameraPosition3d, room);
        if (hasVector3StateChanged(
            { x: camera.position.x, y: camera.position.y, z: camera.position.z },
            nextPosition,
        )) {
            camera.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
        }
        if (!initializedRef.current) {
            camera.lookAt(nextPosition.x, nextPosition.y, nextPosition.z - 1);
            initializedRef.current = true;
        }

        const currentPosition = useDesignStore.getState().walkCameraPosition3d;
        if (hasVector3StateChanged(currentPosition, nextPosition)) {
            useDesignStore.getState().setWalkCameraPosition3d(nextPosition);
        }
    }, [camera, room, walkCameraPosition3d]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case 'w': setMoveState(s => ({ ...s, forward: true })); break;
                case 's': setMoveState(s => ({ ...s, backward: true })); break;
                case 'a': setMoveState(s => ({ ...s, left: true })); break;
                case 'd': setMoveState(s => ({ ...s, right: true })); break;
                case 'q': setMoveState(s => ({ ...s, down: true })); break;
                case 'e': setMoveState(s => ({ ...s, up: true })); break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case 'w': setMoveState(s => ({ ...s, forward: false })); break;
                case 's': setMoveState(s => ({ ...s, backward: false })); break;
                case 'a': setMoveState(s => ({ ...s, left: false })); break;
                case 'd': setMoveState(s => ({ ...s, right: false })); break;
                case 'q': setMoveState(s => ({ ...s, down: false })); break;
                case 'e': setMoveState(s => ({ ...s, up: false })); break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        const speed = 2.5;
        const cam = camera as THREE.PerspectiveCamera;


        direction.current.set(0, 0, -1);
        direction.current.transformDirection(cam.matrix);
        direction.current.y = 0;
        direction.current.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(direction.current, cam.up).normalize();


        velocity.current.set(0, 0, 0);
        if (moveState.forward) velocity.current.add(direction.current);
        if (moveState.backward) velocity.current.sub(direction.current);
        if (moveState.left) velocity.current.sub(right);
        if (moveState.right) velocity.current.add(right);
        if (moveState.up) velocity.current.y += 1;
        if (moveState.down) velocity.current.y -= 1;

        velocity.current.normalize().multiplyScalar(speed * delta);
        cam.position.add(velocity.current);

        const nextPosition = clampWalkCameraPosition(
            { x: cam.position.x, y: cam.position.y, z: cam.position.z },
            room,
        );
        cam.position.set(nextPosition.x, nextPosition.y, nextPosition.z);

        const currentPosition = useDesignStore.getState().walkCameraPosition3d;
        if (hasVector3StateChanged(currentPosition, nextPosition, 0.01)) {
            useDesignStore.getState().setWalkCameraPosition3d(nextPosition);
        }
    });

    return null;
}

function OrbitCameraControls({ camDist }: { camDist: number }) {
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const { room, orbitTarget3d } = useDesignStore();

    const target = useMemo(
        () => clampOrbitTarget(orbitTarget3d, room),
        [orbitTarget3d, room],
    );

    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) {
            return;
        }

        if (hasVector3StateChanged({ x: controls.target.x, y: controls.target.y, z: controls.target.z }, target)) {
            controls.target.set(target.x, target.y, target.z);
            controls.update();
        }

        const currentTarget = useDesignStore.getState().orbitTarget3d;
        if (hasVector3StateChanged(currentTarget, target)) {
            useDesignStore.getState().setOrbitTarget3d(target);
        }
    }, [target]);

    const handleControlsChange = useCallback(() => {
        const controls = controlsRef.current;
        if (!controls) {
            return;
        }

        const nextTarget = clampOrbitTarget(
            { x: controls.target.x, y: controls.target.y, z: controls.target.z },
            useDesignStore.getState().room,
        );

        if (hasVector3StateChanged({ x: controls.target.x, y: controls.target.y, z: controls.target.z }, nextTarget)) {
            controls.target.set(nextTarget.x, nextTarget.y, nextTarget.z);
            controls.update();
        }

        const currentTarget = useDesignStore.getState().orbitTarget3d;
        if (hasVector3StateChanged(currentTarget, nextTarget, 0.01)) {
            useDesignStore.getState().setOrbitTarget3d(nextTarget);
        }
    }, []);

    return (
        <OrbitControls
            ref={controlsRef}
            target={[target.x, target.y, target.z]}
            maxPolarAngle={Math.PI / 2.02}
            minDistance={0.3}
            maxDistance={camDist * 5}
            enableDamping
            dampingFactor={0.06}
            rotateSpeed={0.5}
            panSpeed={0.5}
            makeDefault
            onChange={handleControlsChange}
        />
    );
}


function MouseLookControls() {
    const { camera } = useThree();
    const [isLocked, setIsLocked] = useState(false);
    const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
    const PI_2 = Math.PI / 2;

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isLocked) return;

            const movementX = e.movementX || 0;
            const movementY = e.movementY || 0;

            euler.current.setFromQuaternion(camera.quaternion);
            euler.current.y -= movementX * 0.002;
            euler.current.x -= movementY * 0.002;
            euler.current.x = Math.max(-PI_2, Math.min(PI_2, euler.current.x));
            camera.quaternion.setFromEuler(euler.current);
        };

        const onPointerLockChange = () => {
            setIsLocked(document.pointerLockElement !== null);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('pointerlockchange', onPointerLockChange);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
        };
    }, [camera, isLocked]);

    return null;
}

function CeilingLight({ wallH }: { wallH: number }) {
    const { room } = useDesignStore();
    const on = room.lightsOn;
    return (
        <group>
            <mesh position={[0, wallH - 0.02, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
                <meshStandardMaterial
                    color={on ? "#fff" : "#888"}
                    emissive={on ? "#fff8e0" : "#000"}
                    emissiveIntensity={on ? 0.6 : 0}
                />
            </mesh>
            {on && (
                <mesh position={[0, wallH - 0.06, 0]}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshStandardMaterial
                        color="#fffbe6"
                        emissive="#fff8c4"
                        emissiveIntensity={1.5}
                        transparent
                        opacity={0.5}
                    />
                </mesh>
            )}
        </group>
    );
}

function CozyWallOverlay({
    size,
    position,
    rotation = [0, 0, 0],
}: {
    size: [number, number];
    position: [number, number, number];
    rotation?: [number, number, number];
}) {
    const uniforms = useMemo(
        () => ({
            uTint: { value: new THREE.Color("#f3be8f") },
        }),
        []
    );

    return (
        <mesh position={position} rotation={rotation} renderOrder={1}>
            <planeGeometry args={size} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={`
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
                fragmentShader={`
          varying vec2 vUv;
          uniform vec3 uTint;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            float edge = 1.0 - smoothstep(0.18, 0.95, abs(vUv.x - 0.5) * 2.0);
            float lift = smoothstep(0.05, 1.0, vUv.y);
            float mask = edge * lift;
            float grain = (hash(vUv * vec2(260.0, 220.0)) - 0.5) * 0.04;
            float alpha = clamp(mask * 0.15 + grain * 0.04, 0.0, 0.2);
            vec3 color = uTint * (0.45 + lift * 0.45);
            gl_FragColor = vec4(color, alpha);
          }
        `}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.FrontSide}
                toneMapped={false}
            />
        </mesh>
    );
}

function Room() {
    const { room } = useDesignStore();
    const w = room.width / 100;
    const h = room.height / 100;
    const wallH = room.wallHeight / 100;
    const gridSize = room.gridSize / 100;
    const isCozy = room.renderProfile === "cozy";

    const wallColor = hexToColor(room.wallColor);
    const floorColor = hexToColor(room.floorColor);
    const ceilingColor = hexToColor(room.ceilingColor);

    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[w, h]} />
                <MeshReflectorMaterial
                    color={floorColor}
                    blur={[300, 100]}
                    resolution={512}
                    mixBlur={isCozy ? 0.9 : 0.8}
                    mixStrength={isCozy ? 0.5 : 0.4}
                    roughness={isCozy ? 0.64 : 0.7}
                    depthScale={0.8}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1}
                    metalness={0.1}
                    mirror={isCozy ? 0.2 : 0.3}
                />
            </mesh>

            {isCozy && (
                <mesh position={[0, 0.006, -h * 0.04]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
                    <circleGeometry args={[Math.max(w, h) * 0.34, 64]} />
                    <meshBasicMaterial
                        color="#ffc28f"
                        transparent
                        opacity={0.045}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                    />
                </mesh>
            )}


            {room.showGrid && (
                <group position={[0, 0.001, 0]}>
                    {Array.from({ length: Math.floor(w / gridSize) + 1 }).map((_, i) => {
                        const x = -w / 2 + i * gridSize;
                        const isMajor = i % 4 === 0;
                        return (
                            <Line
                                key={`v-${i}`}
                                points={[
                                    [x, 0, -h / 2],
                                    [x, 0, h / 2],
                                ]}
                                color={
                                    isMajor
                                        ? isCozy
                                            ? "rgba(255,245,232,0.22)"
                                            : "rgba(255,255,255,0.2)"
                                        : isCozy
                                            ? "rgba(255,234,215,0.11)"
                                            : "rgba(255,255,255,0.1)"
                                }
                                lineWidth={isMajor ? 1.5 : 1}
                            />
                        );
                    })}

                    {Array.from({ length: Math.floor(h / gridSize) + 1 }).map((_, i) => {
                        const z = -h / 2 + i * gridSize;
                        const isMajor = i % 4 === 0;
                        return (
                            <Line
                                key={`h-${i}`}
                                points={[
                                    [-w / 2, 0, z],
                                    [w / 2, 0, z],
                                ]}
                                color={
                                    isMajor
                                        ? isCozy
                                            ? "rgba(255,245,232,0.22)"
                                            : "rgba(255,255,255,0.2)"
                                        : isCozy
                                            ? "rgba(255,234,215,0.11)"
                                            : "rgba(255,255,255,0.1)"
                                }
                                lineWidth={isMajor ? 1.5 : 1}
                            />
                        );
                    })}
                </group>
            )}

            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallH, 0]}>
                <planeGeometry args={[w, h]} />
                <meshStandardMaterial color={ceilingColor} roughness={isCozy ? 0.88 : 0.95} side={THREE.DoubleSide} />
            </mesh>

            <mesh position={[0, wallH / 2, -h / 2]} receiveShadow>
                <planeGeometry args={[w, wallH]} />
                <meshPhysicalMaterial
                    color={wallColor}
                    roughness={isCozy ? 0.72 : 0.85}
                    clearcoat={isCozy ? 0.14 : 0.05}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh position={[-w / 2, wallH / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[h, wallH]} />
                <meshPhysicalMaterial
                    color={wallColor}
                    roughness={isCozy ? 0.72 : 0.85}
                    clearcoat={isCozy ? 0.14 : 0.05}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh position={[w / 2, wallH / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[h, wallH]} />
                <meshPhysicalMaterial
                    color={wallColor}
                    roughness={isCozy ? 0.72 : 0.85}
                    clearcoat={isCozy ? 0.14 : 0.05}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {isCozy && (
                <>
                    <CozyWallOverlay size={[w, wallH]} position={[0, wallH / 2, -h / 2 + 0.001]} />
                    <CozyWallOverlay size={[h, wallH]} position={[-w / 2 + 0.001, wallH / 2, 0]} rotation={[0, Math.PI / 2, 0]} />
                    <CozyWallOverlay size={[h, wallH]} position={[w / 2 - 0.001, wallH / 2, 0]} rotation={[0, -Math.PI / 2, 0]} />
                </>
            )}

            {[
                [0, 0.04, -h / 2 + 0.005, w, 0.08, 0.01],
                [-w / 2 + 0.005, 0.04, 0, 0.01, 0.08, h],
                [w / 2 - 0.005, 0.04, 0, 0.01, 0.08, h],
            ].map(([px, py, pz, sx, sy, sz], i) => (
                <mesh key={i} position={[px as number, py as number, pz as number]} castShadow>
                    <boxGeometry args={[sx as number, sy as number, sz as number]} />
                    <meshStandardMaterial color="#ddd" roughness={0.35} metalness={0.05} />
                </mesh>
            ))}

            <CeilingLight wallH={wallH} />
        </group>
    );
}


function FloorLamp3D({ color, opacity }: { color: THREE.Color; opacity: number }) {
    return (
        <group>
            <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.12, 0.15, 0.04, 32]} />
                <meshPhysicalMaterial color={color} roughness={0.3} metalness={0.5} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.8, 0]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 1.5, 12]} />
                <meshPhysicalMaterial color={color} roughness={0.2} metalness={0.6} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, 1.6, 0]} castShadow>
                <coneGeometry args={[0.18, 0.28, 32]} />
                <meshPhysicalMaterial color="#f5f5dc" roughness={0.6} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <pointLight position={[0, 1.5, 0]} intensity={0.5} color="#fff5e6" distance={3} decay={2} />
        </group>
    );
}

function TableLamp3D({ color, opacity }: { color: THREE.Color; opacity: number }) {
    return (
        <group>
            <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.06, 0.08, 0.04, 24]} />
                <meshPhysicalMaterial color={color} roughness={0.3} metalness={0.5} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.18, 0]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.3, 12]} />
                <meshPhysicalMaterial color="#c0c0c0" roughness={0.2} metalness={0.6} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.35, 0]} castShadow>
                <coneGeometry args={[0.12, 0.16, 32]} />
                <meshPhysicalMaterial color="#f5f5dc" roughness={0.6} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <pointLight position={[0, 0.3, 0]} intensity={0.3} color="#fff5e6" distance={2} decay={2} />
        </group>
    );
}

function Rug3D({ w3d, h3d, color, opacity }: { w3d: number; h3d: number; color: THREE.Color; opacity: number }) {
    return (
        <mesh position={[0, 0.005, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w3d, h3d]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent={opacity < 1} opacity={opacity} roughness={0.9} />
        </mesh>
    );
}

function Plant3D({ color, opacity }: { color: THREE.Color; opacity: number }) {
    return (
        <group>
            <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.09, 0.07, 0.24, 16]} />
                <meshPhysicalMaterial color="#8B4513" roughness={0.8} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.35, 0]} castShadow>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshPhysicalMaterial color={color} roughness={0.7} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0.08, 0.45, 0.05]} castShadow>
                <sphereGeometry args={[0.1, 12, 12]} />
                <meshPhysicalMaterial color={color} roughness={0.7} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[-0.06, 0.48, -0.04]} castShadow>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshPhysicalMaterial color={color} roughness={0.7} transparent={opacity < 1} opacity={opacity} />
            </mesh>
        </group>
    );
}

function Wardrobe3D({ w3d, h3d, d3d, color, opacity }: { w3d: number; h3d: number; d3d: number; color: THREE.Color; opacity: number }) {
    return (
        <group>
            <mesh position={[0, d3d / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w3d, d3d, h3d]} />
                <meshPhysicalMaterial color={color} roughness={0.6} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, d3d / 2, h3d / 2 + 0.005]}>
                <boxGeometry args={[0.015, d3d * 0.85, 0.015]} />
                <meshStandardMaterial color="#111" roughness={0.2} metalness={0.6} />
            </mesh>
            <mesh position={[-w3d * 0.2, d3d * 0.5, h3d / 2 + 0.01]}>
                <sphereGeometry args={[0.02, 12, 12]} />
                <meshStandardMaterial color="#222" roughness={0.15} metalness={0.7} />
            </mesh>
            <mesh position={[w3d * 0.2, d3d * 0.5, h3d / 2 + 0.01]}>
                <sphereGeometry args={[0.02, 12, 12]} />
                <meshStandardMaterial color="#222" roughness={0.15} metalness={0.7} />
            </mesh>
        </group>
    );
}

function Bookshelf3D({ w3d, h3d, d3d, color, opacity }: { w3d: number; h3d: number; d3d: number; color: THREE.Color; opacity: number }) {
    const shelfCount = Math.max(3, Math.round(d3d / 0.35));
    return (
        <group>
            <mesh position={[-w3d / 2 + 0.02, d3d / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.03, d3d, h3d]} />
                <meshPhysicalMaterial color={color} roughness={0.6} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[w3d / 2 - 0.02, d3d / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.03, d3d, h3d]} />
                <meshPhysicalMaterial color={color} roughness={0.6} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            {Array.from({ length: shelfCount }).map((_, i) => {
                const y = (i / (shelfCount - 1)) * d3d;
                return (
                    <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
                        <boxGeometry args={[w3d - 0.02, 0.025, h3d]} />
                        <meshPhysicalMaterial color={color} roughness={0.6} transparent={opacity < 1} opacity={opacity} />
                    </mesh>
                );
            })}
            <mesh position={[0, d3d / 2, -h3d / 2 + 0.01]} receiveShadow>
                <boxGeometry args={[w3d - 0.02, d3d, 0.015]} />
                <meshPhysicalMaterial color={color} roughness={0.6} transparent={opacity < 1} opacity={opacity} />
            </mesh>
        </group>
    );
}

function Bed3D({ w3d, h3d, d3d, color, opacity }: { w3d: number; h3d: number; d3d: number; color: THREE.Color; opacity: number }) {
    return (
        <group>
            <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
                <boxGeometry args={[w3d, 0.3, h3d]} />
                <meshPhysicalMaterial color="#8B4513" roughness={0.7} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
                <boxGeometry args={[w3d * 0.95, 0.15, h3d * 0.95]} />
                <meshPhysicalMaterial color={color} roughness={0.8} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.55, -h3d / 2 + 0.04]} castShadow>
                <boxGeometry args={[w3d, 0.6, 0.08]} />
                <meshPhysicalMaterial color="#8B4513" roughness={0.7} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[-w3d * 0.25, 0.52, -h3d * 0.35]} castShadow>
                <boxGeometry args={[w3d * 0.3, 0.1, h3d * 0.18]} />
                <meshStandardMaterial color="#ffffff" roughness={0.85} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[w3d * 0.25, 0.52, -h3d * 0.35]} castShadow>
                <boxGeometry args={[w3d * 0.3, 0.1, h3d * 0.18]} />
                <meshStandardMaterial color="#ffffff" roughness={0.85} transparent={opacity < 1} opacity={opacity} />
            </mesh>
        </group>
    );
}

function Desk3D({ w3d, h3d, d3d, color, opacity }: { w3d: number; h3d: number; d3d: number; color: THREE.Color; opacity: number }) {
    return (
        <group>
            <mesh position={[0, d3d * 0.9, 0]} castShadow receiveShadow>
                <boxGeometry args={[w3d, 0.04, h3d]} />
                <meshPhysicalMaterial color={color} roughness={0.5} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[-w3d * 0.38, d3d * 0.45, 0]} castShadow>
                <boxGeometry args={[w3d * 0.22, d3d * 0.88, h3d * 0.92]} />
                <meshPhysicalMaterial color={color} roughness={0.55} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[w3d * 0.42, d3d * 0.45, h3d * 0.4]} castShadow>
                <boxGeometry args={[0.04, d3d * 0.88, 0.04]} />
                <meshPhysicalMaterial color={color} roughness={0.5} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[w3d * 0.42, d3d * 0.45, -h3d * 0.4]} castShadow>
                <boxGeometry args={[0.04, d3d * 0.88, 0.04]} />
                <meshPhysicalMaterial color={color} roughness={0.5} transparent={opacity < 1} opacity={opacity} />
            </mesh>
        </group>
    );
}

function TVStand3D({ w3d, h3d, d3d, color, opacity }: { w3d: number; h3d: number; d3d: number; color: THREE.Color; opacity: number }) {
    return (
        <group>
            <mesh position={[0, d3d / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w3d, d3d, h3d]} />
                <meshPhysicalMaterial color={color} roughness={0.5} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, d3d + 0.01, -h3d * 0.3]}>
                <boxGeometry args={[w3d * 0.8, 0.02, 0.02]} />
                <meshStandardMaterial color="#333" roughness={0.2} metalness={0.4} />
            </mesh>
        </group>
    );
}

function Cabinet3D({ w3d, h3d, d3d, color, opacity }: { w3d: number; h3d: number; d3d: number; color: THREE.Color; opacity: number }) {
    return (
        <group>
            <mesh position={[0, d3d / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w3d, d3d, h3d]} />
                <meshPhysicalMaterial color={color} roughness={0.6} transparent={opacity < 1} opacity={opacity} />
            </mesh>
            <mesh position={[0, d3d / 2, h3d / 2 + 0.005]}>
                <boxGeometry args={[0.015, d3d * 0.7, 0.015]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.6} />
            </mesh>
        </group>
    );
}

function CatalogModel3D({
    modelUrl,
    w3d,
    h3d,
    d3d,
    opacity,
    modelScale,
    tintColor,
}: {
    modelUrl: string;
    w3d: number;
    h3d: number;
    d3d: number;
    opacity: number;
    modelScale?: number;
    tintColor: string;
}) {
    const gltf = useGLTF(modelUrl);
    const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

    const naturalBox = useMemo(() => {
        return new THREE.Box3().setFromObject(model);
    }, [model]);

    const { scale, offset } = useMemo(() => {
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        naturalBox.getSize(size);
        naturalBox.getCenter(center);

        const srcMax = Math.max(size.x, size.y, size.z, 0.0001);
        const targetMax = Math.max(w3d, d3d, h3d, 0.0001);
        const fittedScale = (targetMax / srcMax) * (modelScale ?? 1);

        return {
            scale: fittedScale,
            offset: new THREE.Vector3(
                -center.x * fittedScale,
                -naturalBox.min.y * fittedScale,
                -center.z * fittedScale,
            ),
        };
    }, [naturalBox, w3d, d3d, h3d, modelScale]);

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
                    mat.color.set(tintColor);
                }
                mat.transparent = opacity < 1;
                mat.opacity = opacity;
                mat.needsUpdate = true;
            });
        });
    }, [model, opacity, tintColor]);

    return (
        <group scale={scale} position={[offset.x, offset.y, offset.z]}>
            <primitive object={model} />
        </group>
    );
}



const FurniturePiece = memo(function FurniturePiece({
    item,
    isSelected,
    onSelect,
}: {
    item: FurnitureItem;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const { room, transformMode, updateItem, pushHistory } = useDesignStore();
    const groupRef = useRef<THREE.Group>(null);
    const modelRootRef = useRef<THREE.Group>(null);
    const modelBoundsRef = useRef(new THREE.Box3());
    const roomW = room.width / 100;
    const roomH = room.height / 100;
    const wallH = room.wallHeight / 100;

    const w3d = item.width / 100;
    const h3d = item.height / 100;
    const d3d = item.depth / 100;

    const x3d = (item.x + item.width / 2) / 100 - roomW / 2;
    const z3d = (item.y + item.height / 2) / 100 - roomH / 2;
    const baseYOffset = item.zIndex * 0.002;
    const y3d = baseYOffset + (item.elevation ?? 0);

    const color = hexToColor(item.color);
    const rotY = -(item.rotation * Math.PI) / 180;

    const matProps = {
        color,
        roughness: 0.5,
        metalness: 0.05,
        clearcoat: 0.1,
        clearcoatRoughness: 0.4,
        transparent: item.opacity < 1,
        opacity: item.opacity,
    };

    const handleTransformChange = useCallback(() => {
        if (!groupRef.current) return;
        const pos = groupRef.current.position;
        const rot = groupRef.current.rotation;

        const halfExtents = getRotatedHalfExtents(w3d, h3d, rot.y);
        const minX = -roomW / 2 + halfExtents.x;
        const maxX = roomW / 2 - halfExtents.x;
        const minZ = -roomH / 2 + halfExtents.z;
        const maxZ = roomH / 2 - halfExtents.z;

        pos.x = clamp(pos.x, minX, maxX);
        pos.z = clamp(pos.z, minZ, maxZ);

        if (modelRootRef.current) {
            modelRootRef.current.updateWorldMatrix(true, true);
            const modelBounds = modelBoundsRef.current.setFromObject(modelRootRef.current);
            const roomMinX = -roomW / 2;
            const roomMaxX = roomW / 2;
            const roomMinZ = -roomH / 2;
            const roomMaxZ = roomH / 2;
            const roomMinY = 0;
            const roomMaxY = wallH;

            if (!modelBounds.isEmpty()) {
                if (modelBounds.min.x < roomMinX && modelBounds.max.x > roomMaxX) {
                    pos.x = 0;
                } else {
                    if (modelBounds.min.x < roomMinX) {
                        pos.x += roomMinX - modelBounds.min.x;
                    }
                    if (modelBounds.max.x > roomMaxX) {
                        pos.x += roomMaxX - modelBounds.max.x;
                    }
                }

                if (modelBounds.min.z < roomMinZ && modelBounds.max.z > roomMaxZ) {
                    pos.z = 0;
                } else {
                    if (modelBounds.min.z < roomMinZ) {
                        pos.z += roomMinZ - modelBounds.min.z;
                    }
                    if (modelBounds.max.z > roomMaxZ) {
                        pos.z += roomMaxZ - modelBounds.max.z;
                    }
                }

                if (modelBounds.min.y < roomMinY && modelBounds.max.y > roomMaxY) {
                    const modelCenterY = (modelBounds.min.y + modelBounds.max.y) / 2;
                    pos.y += (roomMinY + roomMaxY) / 2 - modelCenterY;
                } else {
                    if (modelBounds.min.y < roomMinY) {
                        pos.y += roomMinY - modelBounds.min.y;
                    }
                    if (modelBounds.max.y > roomMaxY) {
                        pos.y += roomMaxY - modelBounds.max.y;
                    }
                }
            }
        }

        const maxPlanX = Math.max(0, roomW * 100 - item.width);
        const maxPlanY = Math.max(0, roomH * 100 - item.height);
        const newX = clamp((pos.x + roomW / 2) * 100 - item.width / 2, 0, maxPlanX);
        const newY = clamp((pos.z + roomH / 2) * 100 - item.height / 2, 0, maxPlanY);
        const newElevation = Math.max(0, pos.y - baseYOffset);
        const newRotation = -(rot.y * 180) / Math.PI;

        pos.x = (newX + item.width / 2) / 100 - roomW / 2;
        pos.z = (newY + item.height / 2) / 100 - roomH / 2;
        pos.y = baseYOffset + newElevation;

        updateItem(item.instanceId, { x: newX, y: newY, elevation: newElevation, rotation: newRotation });
    }, [baseYOffset, item.instanceId, item.width, item.height, roomW, roomH, updateItem, w3d, h3d, wallH]);

    const handleTransformEnd = useCallback(() => {
        pushHistory();
    }, [pushHistory]);

    const isLamp = item.catalogId.startsWith("lamp-");
    const isRug = item.catalogId === "decor-rug";
    const isPlant = item.catalogId === "decor-plant";
    const isWardrobe = item.catalogId === "shelf-wardrobe";
    const isBookshelf = item.catalogId === "shelf-bookcase";
    const isBed = item.catalogId.startsWith("bed-") && !item.catalogId.includes("nightstand");
    const isDesk = item.catalogId.startsWith("desk-");
    const isTVStand = item.catalogId === "shelf-tv-stand";
    const isCabinet = item.catalogId === "decor-storage" || item.catalogId === "shelf-display";
    const catalogItem = FURNITURE_CATALOG.find((entry) => entry.id === item.catalogId);
    const hasCustomModel = Boolean(catalogItem?.modelUrl);

    let furnitureModel: React.ReactNode;
    const glbFallbackModel = (
        <mesh position={[0, d3d / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w3d, d3d, h3d]} />
            <meshPhysicalMaterial {...matProps} />
        </mesh>
    );

    if (hasCustomModel && catalogItem?.modelUrl) {
        furnitureModel = (
            <ModelLoadBoundary fallback={glbFallbackModel}>
                <Suspense fallback={glbFallbackModel}>
                    <CatalogModel3D
                        modelUrl={catalogItem.modelUrl}
                        modelScale={item.modelScale ?? catalogItem.modelScale ?? 1}
                        w3d={w3d}
                        h3d={h3d}
                        d3d={d3d}
                        opacity={item.opacity}
                        tintColor={item.color}
                    />
                </Suspense>
            </ModelLoadBoundary>
        );
    } else if (isLamp && item.catalogId === "lamp-floor") {
        furnitureModel = <FloorLamp3D color={color} opacity={item.opacity} />;
    } else if (isLamp && item.catalogId === "lamp-table") {
        furnitureModel = <TableLamp3D color={color} opacity={item.opacity} />;
    } else if (isRug) {
        furnitureModel = <Rug3D w3d={w3d} h3d={h3d} color={color} opacity={item.opacity} />;
    } else if (isPlant) {
        furnitureModel = <Plant3D color={color} opacity={item.opacity} />;
    } else if (isWardrobe) {
        furnitureModel = <Wardrobe3D w3d={w3d} h3d={h3d} d3d={d3d} color={color} opacity={item.opacity} />;
    } else if (isBookshelf) {
        furnitureModel = <Bookshelf3D w3d={w3d} h3d={h3d} d3d={d3d} color={color} opacity={item.opacity} />;
    } else if (isBed) {
        furnitureModel = <Bed3D w3d={w3d} h3d={h3d} d3d={d3d} color={color} opacity={item.opacity} />;
    } else if (isDesk) {
        furnitureModel = <Desk3D w3d={w3d} h3d={h3d} d3d={d3d} color={color} opacity={item.opacity} />;
    } else if (isTVStand) {
        furnitureModel = <TVStand3D w3d={w3d} h3d={h3d} d3d={d3d} color={color} opacity={item.opacity} />;
    } else if (isCabinet) {
        furnitureModel = <Cabinet3D w3d={w3d} h3d={h3d} d3d={d3d} color={color} opacity={item.opacity} />;
    } else if (item.shapeType === "circle") {
        furnitureModel = (
            <group>
                {d3d > 0.5 &&
                    [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
                        <mesh key={i} position={[dx * w3d * 0.35, 0.15, dz * w3d * 0.35]} castShadow>
                            <cylinderGeometry args={[0.012, 0.018, 0.3, 8]} />
                            <meshStandardMaterial color="#222" roughness={0.2} metalness={0.6} />
                        </mesh>
                    ))}
                <mesh position={[0, d3d / 2, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[w3d / 2, w3d / 2, d3d * 0.3, 32]} />
                    <meshPhysicalMaterial {...matProps} />
                </mesh>
            </group>
        );
    } else if (item.shapeType === "ellipse") {
        furnitureModel = (
            <mesh position={[0, d3d / 2, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[w3d / 2, w3d / 2, d3d * 0.3, 32]} />
                <meshPhysicalMaterial {...matProps} />
            </mesh>
        );
    } else {
        const isChairLike = d3d > 0.5 && w3d < 1;
        const isSofaLike = d3d > 0.5 && w3d >= 1;

        if (isChairLike) {
            const legMat = { color: "#1a1a1a", roughness: 0.15, metalness: 0.7 };
            furnitureModel = (
                <group>
                    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
                        <mesh key={i} position={[dx * (w3d / 2 - 0.03), 0.2, dz * (h3d / 2 - 0.03)]} castShadow>
                            <cylinderGeometry args={[0.012, 0.015, 0.4, 8]} />
                            <meshStandardMaterial {...legMat} />
                        </mesh>
                    ))}
                    <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
                        <boxGeometry args={[w3d * 0.92, 0.05, h3d * 0.92]} />
                        <meshPhysicalMaterial {...matProps} />
                    </mesh>
                    <mesh position={[0, 0.72, -h3d / 2 + 0.025]} castShadow>
                        <boxGeometry args={[w3d * 0.88, 0.55, 0.035]} />
                        <meshPhysicalMaterial {...matProps} />
                    </mesh>
                </group>
            );
        } else if (isSofaLike) {
            const sH = 0.38;
            const armW = 0.09;
            furnitureModel = (
                <group>
                    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dz], i) => (
                        <mesh key={i} position={[dx * (w3d / 2 - 0.06), 0.05, dz * (h3d / 2 - 0.06)]} castShadow>
                            <cylinderGeometry args={[0.02, 0.025, 0.1, 8]} />
                            <meshStandardMaterial color="#111" roughness={0.2} metalness={0.6} />
                        </mesh>
                    ))}
                    <mesh position={[0, sH / 2 + 0.1, 0.03]} castShadow receiveShadow>
                        <boxGeometry args={[w3d - 0.02, sH, h3d - 0.02]} />
                        <meshPhysicalMaterial {...matProps} roughness={0.75} />
                    </mesh>
                    <mesh position={[0, sH + 0.25, -h3d / 2 + 0.08]} castShadow>
                        <boxGeometry args={[w3d - armW * 2 - 0.02, 0.32, 0.13]} />
                        <meshPhysicalMaterial {...matProps} roughness={0.8} />
                    </mesh>
                    <mesh position={[-w3d / 2 + armW / 2, sH + 0.08, 0.03]} castShadow>
                        <boxGeometry args={[armW, 0.22, h3d * 0.85]} />
                        <meshPhysicalMaterial {...matProps} roughness={0.8} />
                    </mesh>
                    <mesh position={[w3d / 2 - armW / 2, sH + 0.08, 0.03]} castShadow>
                        <boxGeometry args={[armW, 0.22, h3d * 0.85]} />
                        <meshPhysicalMaterial {...matProps} roughness={0.8} />
                    </mesh>
                </group>
            );
        } else if (item.shapeType === "l-shape") {
            furnitureModel = (
                <group>
                    <mesh position={[0, d3d / 2, h3d * 0.15]} castShadow receiveShadow>
                        <boxGeometry args={[w3d, d3d, h3d * 0.5]} />
                        <meshPhysicalMaterial {...matProps} />
                    </mesh>
                    <mesh position={[-w3d * 0.3, d3d / 2, -h3d * 0.15]} castShadow>
                        <boxGeometry args={[w3d * 0.4, d3d, h3d * 0.5]} />
                        <meshPhysicalMaterial {...matProps} />
                    </mesh>
                </group>
            );
        } else {
            furnitureModel = (
                <mesh position={[0, d3d / 2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[w3d, d3d, h3d]} />
                    <meshPhysicalMaterial {...matProps} />
                </mesh>
            );
        }
    }

    const selectionRingRadius = Math.max(w3d, h3d) * 0.7;
    const shadowStrength = Math.min(1, Math.max(0, item.shadowBlur / 30));

    return (
        <>
            <group
                ref={groupRef}
                position={[x3d, y3d, z3d]}
                rotation={[0, rotY, 0]}
                renderOrder={item.zIndex}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}
            >
                {shadowStrength > 0 && (
                    <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[w3d * 0.55, h3d * 0.55, 1]} renderOrder={item.zIndex - 1}>
                        <circleGeometry args={[1, 32]} />
                        <meshBasicMaterial color="#000" transparent opacity={0.08 + shadowStrength * 0.2} depthWrite={false} />
                    </mesh>
                )}
                <group ref={modelRootRef}>{furnitureModel}</group>
                {isSelected && (
                    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[selectionRingRadius * 0.85, selectionRingRadius, 48]} />
                        <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} side={THREE.DoubleSide} />
                    </mesh>
                )}
            </group>
            {isSelected && !item.locked && groupRef.current && (
                <TransformControls
                    object={groupRef.current}
                    mode={transformMode}
                    onObjectChange={handleTransformChange}
                    onMouseUp={handleTransformEnd}
                    size={0.6}
                />
            )}
        </>
    );
});

function CameraZoomUpdater({ zoom }: { zoom: number }) {
    const camera = useThree((state) => state.camera);
    useFrame(() => {
        if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.zoom - zoom) > 0.001) {
            camera.zoom = zoom;
            camera.updateProjectionMatrix();
        }
    });
    return null;
}

function SceneSetup({ zoom }: { zoom?: number }) {
    const { room, cameraMode, walkCameraPosition3d } = useDesignStore();
    const camDist = (Math.max(room.width, room.height) / 100) * 1.3;
    const roomW = room.width / 100;
    const roomH = room.height / 100;
    const wallH = room.wallHeight / 100;
    const on = room.lightsOn;
    const isCozy = room.renderProfile === "cozy";
    const keyShadowMap: [number, number] = isCozy ? [3072, 3072] : [2048, 2048];
    const shadowFrustum = Math.max(8, camDist * 1.6);

    return (
        <>
            <PerspectiveCamera
                makeDefault
                position={cameraMode === "walk" ? [walkCameraPosition3d.x, walkCameraPosition3d.y, walkCameraPosition3d.z] : [camDist * 0.55, camDist * 0.6, camDist * 0.8]}
                fov={cameraMode === "walk" ? 75 : 42}
                near={0.01}
                far={200}
            />
            {zoom == null ? null : <CameraZoomUpdater zoom={zoom} />}

            {cameraMode === "orbit" ? (
                <OrbitCameraControls camDist={camDist} />
            ) : (
                <>
                    <FirstPersonControls />
                    <MouseLookControls />
                </>
            )}

            <ambientLight intensity={on ? (isCozy ? 0.28 : 0.38) : isCozy ? 0.06 : 0.06} />

            <directionalLight
                position={isCozy ? [4.2, 7.3, 2.8] : [5, 10, 5]}
                intensity={on ? (isCozy ? 1.2 : 1.05) : isCozy ? 0.14 : 0.12}
                color={isCozy ? "#ffe0c4" : "#f2f4ff"}
                castShadow
                shadow-mapSize={keyShadowMap}
                shadow-camera-far={50}
                shadow-camera-left={-shadowFrustum}
                shadow-camera-right={shadowFrustum}
                shadow-camera-top={shadowFrustum}
                shadow-camera-bottom={-shadowFrustum}
                shadow-bias={isCozy ? -0.00025 : -0.0002}
                shadow-radius={isCozy ? 3 : 4}
            />
            <directionalLight
                position={isCozy ? [-3.8, 5.4, -2.2] : [-4, 6, -3]}
                intensity={on ? (isCozy ? 0.24 : 0.28) : isCozy ? 0.05 : 0.05}
                color={isCozy ? "#a2b4cf" : "#9bb8d8"}
            />

            <pointLight
                position={[0, wallH - 0.25, 0]}
                intensity={on ? (isCozy ? 0.55 : 0.5) : 0}
                distance={isCozy ? 11 : 10}
                color={isCozy ? "#ffe1bf" : "#fff3e0"}
                decay={2}
            />
            <spotLight
                position={[roomW * 0.16, wallH - 0.08, roomH * 0.05]}
                angle={isCozy ? Math.PI / 3.4 : Math.PI / 3}
                penumbra={isCozy ? 0.92 : 0.8}
                intensity={on ? (isCozy ? 0.38 : 0.3) : 0}
                distance={isCozy ? 9 : 8}
                color={isCozy ? "#ffe0c0" : "#fffaf0"}
                castShadow={false}
            />

            {isCozy && on && (
                <spotLight
                    position={[-roomW * 0.24, wallH - 0.2, -roomH * 0.18]}
                    angle={Math.PI / 4.8}
                    penumbra={1}
                    intensity={0.22}
                    distance={6}
                    color="#ffb487"
                    castShadow={false}
                />
            )}

            {!on && <directionalLight position={[2, 4, 6]} intensity={0.08} color="#c4d4ff" />}

            <ContactShadows
                position={[0, -0.002, 0]}
                opacity={on ? (isCozy ? 0.36 : 0.3) : isCozy ? 0.18 : 0.15}
                scale={(Math.max(room.width, room.height) / 100) * 2}
                blur={isCozy ? 2.4 : 3}
                far={isCozy ? 7 : 6}
            />

            <Environment
                preset={isCozy ? "sunset" : "apartment"}
                environmentIntensity={on ? (isCozy ? 0.35 : 0.38) : isCozy ? 0.08 : 0.08}
            />
        </>
    );
}

function ScenePostProcessing() {
    const { room } = useDesignStore();
    const isCozy = room.renderProfile === "cozy";

    if (!room.postFxEnabled) {
        return null;
    }

    return (
        <EffectComposer multisampling={8}>
            <N8AO
                aoRadius={isCozy ? 0.42 : 0.3}
                distanceFalloff={isCozy ? 0.7 : 0.6}
                intensity={isCozy ? 1.8 : 0.85}
                quality={isCozy ? "high" : "medium"}
                aoSamples={isCozy ? 20 : 16}
                denoiseSamples={isCozy ? 6 : 10}
                denoiseRadius={isCozy ? 8 : 12}
            />
            <Bloom
                mipmapBlur
                intensity={isCozy ? 0.22 : 0.08}
                luminanceThreshold={isCozy ? 0.62 : 0.85}
                luminanceSmoothing={0.25}
            />
            <Vignette eskil={false} offset={0.2} darkness={isCozy ? 0.36 : 0.26} />
        </EffectComposer>
    );
}

export function RoomViewer3D({ zoom }: { zoom?: number } = {}) {
    const { items, selectedItemId, selectItem, room, cameraMode, setCameraMode } = useDesignStore();
    const sortedItems = useMemo(() => [...items].sort((a, b) => a.zIndex - b.zIndex), [items]);
    const isCozy = room.renderProfile === "cozy";
    const exposure = isCozy ? (room.lightsOn ? 1.16 : 1) : 1.1;
    const bgColor = isCozy ? "#100d0a" : "#0a0b0e";

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && cameraMode === "walk") {
                setCameraMode("orbit");
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cameraMode, setCameraMode]);

    return (
        <div className="flex-1 bg-[#f7e7e1] relative" role="region" aria-label="3D room visualization">

            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg px-3 py-2 text-[10px] text-slate-500 font-mono">
                {cameraMode === "walk" ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-3">
                            <span><kbd className="px-1.5 py-0.5 bg-[#f7e7e1] border border-slate-200 rounded text-slate-600">W A S D</kbd> Move</span>
                            <span><kbd className="px-1.5 py-0.5 bg-[#f7e7e1] border border-slate-200 rounded text-slate-600">Q E</kbd> Up/Down</span>
                        </div>
                        <div className="text-slate-400 text-[9px]">Move mouse to look around • Click to lock cursor</div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <span><kbd className="px-1.5 py-0.5 bg-[#f7e7e1] border border-slate-200 rounded text-slate-600">Drag</kbd> Orbit</span>
                        <span><kbd className="px-1.5 py-0.5 bg-[#f7e7e1] border border-slate-200 rounded text-slate-600">Scroll</kbd> Zoom</span>
                        <span><kbd className="px-1.5 py-0.5 bg-[#f7e7e1] border border-slate-200 rounded text-slate-600">Click</kbd> Select</span>
                    </div>
                )}
            </div>

            <Canvas
                shadows
                dpr={[1, 1.5]}
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure }}
                className="w-full h-full"
                onPointerMissed={() => selectItem(null)}
            >
                <color attach="background" args={[bgColor]} />
                <SceneSetup zoom={zoom} />
                <GradientBackground profile={room.renderProfile} />
                <Room />
                {sortedItems.map((item) => (
                    <FurniturePiece
                        key={item.instanceId}
                        item={item}
                        isSelected={selectedItemId === item.instanceId}
                        onSelect={() => selectItem(item.instanceId)}
                    />
                ))}
                <ScenePostProcessing />
            </Canvas>

            {cameraMode === "walk" && (
                <div className="absolute bottom-3 right-3 bg-white/10  backdrop-blur-md border border-white    rounded-lg px-3 py-1.5 text-[10px] text-black-400 font-medium pointer-events-none">
                    Walk Mode Active - Press Esc to unlock cursor
                </div>
            )}
        </div>
    );
}
