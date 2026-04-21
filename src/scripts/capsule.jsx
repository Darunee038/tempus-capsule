import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Line, Text, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const assetUrl = (path) => `/${String(path).replace(/^\/+/, "")}`;

function getRotationFromNormal(normal) {
    const up = new THREE.Vector3(0, 1, 0);

    if (Math.abs(normal.dot(up)) > 0.9) {
        up.set(1, 0, 0);
    }

    const tangent = new THREE.Vector3().crossVectors(up, normal).normalize();
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
    const matrix = new THREE.Matrix4().makeBasis(tangent, bitangent, normal);

    return new THREE.Euler().setFromRotationMatrix(matrix);
}

function applyRotationOffset(rotation, normal, angle) {
    return new THREE.Euler().setFromQuaternion(
        applyRotationOffsetQuaternion(
            new THREE.Quaternion().setFromEuler(rotation),
            normal,
            angle
        )
    );
}

function applyRotationOffsetQuaternion(baseQuaternion, normal, angle) {
    const twistQuaternion = new THREE.Quaternion().setFromAxisAngle(
        normal.clone().normalize(),
        angle
    );

    return baseQuaternion.clone().multiply(twistQuaternion);
}

function getBaseStickerRotation(rotation, normal, rotationOffset = 0) {
    return new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion().setFromEuler(rotation).premultiply(
            new THREE.Quaternion().setFromAxisAngle(
                normal.clone().normalize(),
                -rotationOffset
            )
        )
    );
}

function stabilizeRotationFromReference(baseRotation, normal, referenceRotation, rotationOffset = 0) {
    if (!referenceRotation) return baseRotation;

    const baseQuaternion = new THREE.Quaternion().setFromEuler(baseRotation);
    const flippedQuaternion = baseQuaternion.clone().multiply(
        new THREE.Quaternion().setFromAxisAngle(normal.clone().normalize(), Math.PI)
    );
    const referenceQuaternion = new THREE.Quaternion().setFromEuler(referenceRotation);
    const visibleBaseQuaternion = new THREE.Quaternion().setFromEuler(
        applyRotationOffset(baseRotation, normal, rotationOffset)
    );
    const visibleFlippedQuaternion = new THREE.Quaternion().setFromEuler(
        applyRotationOffset(new THREE.Euler().setFromQuaternion(flippedQuaternion), normal, rotationOffset)
    );

    return visibleBaseQuaternion.angleTo(referenceQuaternion) <= visibleFlippedQuaternion.angleTo(referenceQuaternion)
        ? baseRotation
        : new THREE.Euler().setFromQuaternion(flippedQuaternion);
}

function transportVisibleQuaternion(referenceVisibleRotation, fromNormal, toNormal) {
    if (!referenceVisibleRotation || !fromNormal || !toNormal) {
        return null;
    }

    const from = fromNormal.clone().normalize();
    const to = toNormal.clone().normalize();
    const alignmentQuaternion = new THREE.Quaternion().setFromUnitVectors(from, to);

    return alignmentQuaternion.multiply(
        new THREE.Quaternion().setFromEuler(referenceVisibleRotation)
    );
}

function getBaseRotationFromVisibleQuaternion(visibleQuaternion, normal, rotationOffset = 0) {
    const untwistQuaternion = new THREE.Quaternion().setFromAxisAngle(
        normal.clone().normalize(),
        -rotationOffset
    );

    return new THREE.Euler().setFromQuaternion(
        visibleQuaternion.clone().multiply(untwistQuaternion)
    );
}

function isStickerObject(object) {
    let current = object;

    while (current) {
        if (current.userData?.isSticker) return true;
        current = current.parent;
    }

    return false;
}

const stickerTextureCache = new Map();

function useStickerTexture(textureUrl) {
    const [texture, setTexture] = useState(() => stickerTextureCache.get(textureUrl) || null);

    useEffect(() => {
        if (!textureUrl) {
            setTexture(null);
            return;
        }

        const cachedTexture = stickerTextureCache.get(textureUrl);
        if (cachedTexture) {
            setTexture(cachedTexture);
            return;
        }

        let isDisposed = false;
        const loader = new THREE.TextureLoader();
        loader.load(textureUrl, (loadedTexture) => {
            if (isDisposed) return;

            loadedTexture.flipY = true;
            loadedTexture.needsUpdate = true;
            stickerTextureCache.set(textureUrl, loadedTexture);
            setTexture(loadedTexture);
        });

        return () => {
            isDisposed = true;
        };
    }, [textureUrl]);

    return texture;
}

const TOP_STICKER_MESH_NAMES = new Set([
    "Inner_CoreTop",
    "Top_Inner_Core",
    "S_Top_Inner_Core"
]);

function isTopStickerMeshName(name) {
    return TOP_STICKER_MESH_NAMES.has(name);
}

function getTopStickerMeshesFromMesh(mesh) {
    const parent = mesh?.parent;
    if (!parent?.children) return mesh ? [mesh] : [];

    return parent.children.filter(
        (child) =>
            child?.isMesh &&
            isTopStickerMeshName(child.name) &&
            child.userData?.stickerTarget &&
            child.userData?.part === "A"
    );
}

function getStickerAnchorObject(scene, sticker) {
    const mesh = scene.getObjectByProperty("uuid", sticker.meshId);
    if (!mesh) return null;

    if (sticker.part === "A") {
        const topMeshes = getTopStickerMeshesFromMesh(mesh);
        return topMeshes[0]?.parent || mesh.parent || mesh;
    }

    return mesh;
}

function getStickerTargetMeshes(scene, sticker) {
    const mesh = scene.getObjectByProperty("uuid", sticker.meshId);
    if (!mesh) return [];

    if (sticker.part === "A") {
        return getTopStickerMeshesFromMesh(mesh);
    }

    return [mesh];
}

function getAllStickerTargetMeshes(scene) {
    const meshes = [];

    scene.traverse((child) => {
        if (child?.isMesh && child.userData?.stickerTarget) {
            meshes.push(child);
        }
    });

    return meshes;
}

function worldDirectionToLocal(mesh, worldDirection) {
    const localOrigin = mesh.worldToLocal(new THREE.Vector3(0, 0, 0));
    const localTarget = mesh.worldToLocal(worldDirection.clone());
    return localTarget.sub(localOrigin).normalize();
}

function getWorldFaceNormal(hit) {
    if (!hit?.face || !hit.object) return null;
    return hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
}

function getStickerTargetObject(object) {
    let current = object;

    while (current) {
        if (current.userData?.stickerTarget) return current;
        current = current.parent;
    }

    return null;
}

const OUTWARD_STICKER_NORMAL_MESH_NAMES = new Set([
    "Top_Inner_Core",
    "S_Top_Inner_Core"
]);

function isOutwardStickerNormalMesh(mesh) {
    return Boolean(mesh && OUTWARD_STICKER_NORMAL_MESH_NAMES.has(mesh.name));
}

function resolveStickerNormal(mesh, localPoint, localNormal) {
    const nextNormal = localNormal.clone().normalize();

    if (!mesh?.geometry || !isOutwardStickerNormalMesh(mesh)) {
        return nextNormal;
    }

    if (!mesh.geometry.boundingBox) {
        mesh.geometry.computeBoundingBox();
    }

    const box = mesh.geometry.boundingBox;
    if (!box) return nextNormal;

    const outward = localPoint.clone().sub(box.getCenter(new THREE.Vector3()));
    if (outward.lengthSq() < 1e-6) {
        return nextNormal;
    }

    if (nextNormal.dot(outward) < 0) {
        nextNormal.multiplyScalar(-1);
    }

    return nextNormal.normalize();
}

function getResolvedLocalFaceNormal(hit) {
    if (!hit?.face || !hit.object) return null;

    const targetMesh = getStickerTargetObject(hit.object) || hit.object;
    const localSurfacePoint = targetMesh.worldToLocal(hit.point.clone());
    return resolveStickerNormal(
        targetMesh,
        localSurfacePoint,
        hit.face.normal.clone().normalize()
    );
}

function getResolvedWorldFaceNormal(hit) {
    if (!hit?.face || !hit.object) return null;

    const targetMesh = getStickerTargetObject(hit.object) || hit.object;
    const resolvedLocalNormal = getResolvedLocalFaceNormal(hit);
    if (!resolvedLocalNormal) return null;

    return resolvedLocalNormal.transformDirection(targetMesh.matrixWorld).normalize();
}

function isOuterStickerSurfaceHit(hit) {
    if (!hit?.face || !hit.object) return false;

    const targetMesh = getStickerTargetObject(hit.object) || hit.object;
    if (!targetMesh?.geometry) return true;

    if (!targetMesh.geometry.boundingBox) {
        targetMesh.geometry.computeBoundingBox();
    }

    const box = targetMesh.geometry.boundingBox;
    if (!box) return true;

    const localPoint = targetMesh.worldToLocal(hit.point.clone());
    const localNormal = getResolvedLocalFaceNormal(hit);
    if (!localNormal) return false;

    const outward = localPoint.sub(box.getCenter(new THREE.Vector3()));
    if (outward.lengthSq() < 1e-6) return true;

    return localNormal.dot(outward.normalize()) >= -0.02;
}

function getStickerSurfacePush(part, isTopCapSticker, normal) {
    const normalY = normal?.y || 0;
    const isNearVertical = Math.abs(normalY) > 0.9;

    if (part === "A") {
        if (isTopCapSticker) {
            return isNearVertical ? 0.0018 : 0.0038;
        }
        return isNearVertical ? 0.0022 : 0.008;
    }

    return isNearVertical ? 0.0016 : 0.0032;
}

function getStickerProjectionLift(part, isTopCapSticker, normal) {
    const isNearVertical = Math.abs(normal?.y || 0) > 0.9;

    if (part === "A") {
        if (isTopCapSticker) return isNearVertical ? 0.00055 : 0.0011;
        return isNearVertical ? 0.0008 : 0.0024;
    }

    return isNearVertical ? 0.00065 : 0.0022;
}

function getStickerTransformFromHit(scene, hit, referenceRotation = null, rotationOffset = 0, referenceNormal = null) {
    let targetMesh = hit?.object;
    while (targetMesh && !targetMesh.userData?.stickerTarget) {
        targetMesh = targetMesh.parent;
    }

    if (!targetMesh || !hit?.face) return null;

    const nextPart = targetMesh.userData?.part;
    const stickerAnchor = getStickerAnchorObject(scene, {
        part: nextPart,
        meshId: targetMesh.uuid
    }) || targetMesh;

    const worldNormal = getResolvedWorldFaceNormal(hit) || getWorldFaceNormal(hit);
    if (!worldNormal) return null;

    const localSurfacePoint = targetMesh.worldToLocal(hit.point.clone());
    const resolvedLocalNormal = resolveStickerNormal(
        targetMesh,
        localSurfacePoint,
        hit.face.normal.clone().normalize()
    );
    const correctedWorldNormal = resolvedLocalNormal.clone().transformDirection(targetMesh.matrixWorld);
    const normal = worldDirectionToLocal(stickerAnchor, correctedWorldNormal);
    const localPosition = stickerAnchor.worldToLocal(hit.point.clone());

    const transportedVisibleQuaternion = transportVisibleQuaternion(
        referenceRotation,
        referenceNormal || normal,
        normal
    );
    const baseRotation = transportedVisibleQuaternion
        ? getBaseRotationFromVisibleQuaternion(transportedVisibleQuaternion, normal, rotationOffset)
        : getRotationFromNormal(normal);

    return {
        part: nextPart,
        meshId: targetMesh.uuid,
        sourceMeshName: targetMesh.name,
        stickerAnchor,
        localPosition,
        normal,
        rotation: transportedVisibleQuaternion
            ? baseRotation
            : stabilizeRotationFromReference(baseRotation, normal, referenceRotation, rotationOffset)
    };
}

function isBodyOuterWallHit(hit) {
    if (!hit?.face || !hit.object) return false;

    const targetMesh = getStickerTargetObject(hit.object) || hit.object;
    if (!targetMesh?.geometry) return true;

    if (!targetMesh.geometry.boundingBox) {
        targetMesh.geometry.computeBoundingBox();
    }

    const box = targetMesh.geometry.boundingBox;
    if (!box) return true;

    const localPoint = targetMesh.worldToLocal(hit.point.clone());
    const worldNormal = getResolvedWorldFaceNormal(hit) || getWorldFaceNormal(hit);
    if (!worldNormal) return false;

    const radiusX = Math.max(Math.abs(box.max.x), Math.abs(box.min.x), 0.0001);
    const radiusZ = Math.max(Math.abs(box.max.z), Math.abs(box.min.z), 0.0001);
    const radialRatio = Math.hypot(localPoint.x / radiusX, localPoint.z / radiusZ);
    const height = Math.max(box.max.y - box.min.y, 0.0001);
    const lowerBlendStart = box.min.y + height * 0.28;

    if (localPoint.y <= lowerBlendStart) {
        return radialRatio >= 0.72 && Math.abs(worldNormal.y) < 0.92;
    }

    return radialRatio >= 0.86 && Math.abs(worldNormal.y) < 0.72;
}

function getBodyOuterWallScore(hit) {
    if (!hit?.face || !hit.object) return -Infinity;

    const targetMesh = getStickerTargetObject(hit.object) || hit.object;
    if (!targetMesh?.geometry) return hit.distance ?? -Infinity;

    if (!targetMesh.geometry.boundingBox) {
        targetMesh.geometry.computeBoundingBox();
    }

    const box = targetMesh.geometry.boundingBox;
    if (!box) return hit.distance ?? -Infinity;

    const localPoint = targetMesh.worldToLocal(hit.point.clone());
    const radiusX = Math.max(Math.abs(box.max.x), Math.abs(box.min.x), 0.0001);
    const radiusZ = Math.max(Math.abs(box.max.z), Math.abs(box.min.z), 0.0001);
    const radialRatio = Math.hypot(localPoint.x / radiusX, localPoint.z / radiusZ);

    return radialRatio * 1000 - (hit.distance ?? 0);
}

function pickValidStickerHit(hits, options = {}) {
    const { requireUpward = false, rayDirection = null, part = null } = options;

    const validHits = hits.filter((hit) => {
        const worldNormal = getResolvedWorldFaceNormal(hit) || getWorldFaceNormal(hit);
        if (!worldNormal) return false;
        if (!isOuterStickerSurfaceHit(hit)) return false;
        if (part === "B" && !isBodyOuterWallHit(hit)) return false;

        if (rayDirection && worldNormal.dot(rayDirection) > -0.08) {
            return false;
        }

        if (requireUpward && worldNormal.y < 0.45) {
            return false;
        }

        return true;
    });

    if (!validHits.length) return null;

    if (part === "B") {
        validHits.sort((a, b) => getBodyOuterWallScore(b) - getBodyOuterWallScore(a));
    }

    return validHits[0];
}

function getTopStickerSlots(mesh) {
    if (!mesh?.geometry) return [];

    if (!mesh.geometry.boundingBox) {
        mesh.geometry.computeBoundingBox();
    }

    const box = mesh.geometry.boundingBox;
    if (!box) return [];

    const centerX = (box.min.x + box.max.x) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;
    const y = box.max.y + 0.002;
    const spreadX = (box.max.x - box.min.x) * 0.18;
    const spreadZ = (box.max.z - box.min.z) * 0.12;

    return [
        { key: "top-left", position: new THREE.Vector3(centerX - spreadX, y, centerZ + spreadZ) },
        { key: "top-center", position: new THREE.Vector3(centerX, y, centerZ - spreadZ * 0.4) },
        { key: "top-right", position: new THREE.Vector3(centerX + spreadX, y, centerZ + spreadZ) }
    ];
}

function TopLabel({ mesh, text }) {
    const label = text.trim().slice(0, 3).toUpperCase();

    const labelPosition = useMemo(() => {
        const slots = getTopStickerSlots(mesh);
        if (!slots.length) return new THREE.Vector3(0, 0, 0);

        const centerSlot = slots.find((slot) => slot.key === "top-center") || slots[0];
        return centerSlot.position.clone().add(new THREE.Vector3(0, 0.006, 0));
    }, [mesh]);

    if (!mesh || !label) return null;

    return (
        <Text
            position={labelPosition}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.11}
            color="#7f6c64"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.003}
            outlineColor="rgba(255,255,255,0.85)"
            ref={(ref) => {
                if (ref) {
                    ref.userData.isSticker = true;
                }

                if (ref && mesh && ref.parent !== mesh) {
                    mesh.add(ref);
                }
            }}
        >
            {label}
        </Text>
    );
}

function BodyLabel({ mesh, text }) {
    const label = text.trim().slice(0, 18);

    const labelPosition = useMemo(() => {
        if (!mesh?.geometry) return new THREE.Vector3(0, 0, 0);
        if (!mesh.geometry.boundingBox) {
            mesh.geometry.computeBoundingBox();
        }

        const box = mesh.geometry.boundingBox;
        if (!box) return new THREE.Vector3(0, 0, 0);

        const centerX = (box.min.x + box.max.x) / 2;
        const centerY = box.min.y + (box.max.y - box.min.y) * 0.52;
        const frontZ = box.max.z + 0.01;

        return new THREE.Vector3(centerX, centerY, frontZ);
    }, [mesh]);

    if (!mesh || !label) return null;

    return (
        <Text
            position={labelPosition}
            fontSize={0.12}
            maxWidth={1.15}
            color="#7f6c64"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.0025}
            outlineColor="rgba(255,255,255,0.82)"
            ref={(ref) => {
                if (ref && mesh && ref.parent !== mesh) {
                    mesh.add(ref);
                }
            }}
        >
            {label}
        </Text>
    );
}

function buildSplitGeometry(sourceGeometry, predicate) {
    const geometry = sourceGeometry.index ? sourceGeometry.toNonIndexed() : sourceGeometry.clone();
    const positions = geometry.getAttribute("position");
    const normals = geometry.getAttribute("normal");
    const uvs = geometry.getAttribute("uv");

    if (!positions) return null;

    const nextPositions = [];
    const nextNormals = [];
    const nextUvs = [];

    for (let i = 0; i < positions.count; i += 3) {
        const centroidY =
            (positions.getY(i) + positions.getY(i + 1) + positions.getY(i + 2)) / 3;

        if (!predicate(centroidY)) continue;

        for (let j = 0; j < 3; j += 1) {
            nextPositions.push(
                positions.getX(i + j),
                positions.getY(i + j),
                positions.getZ(i + j)
            );

            if (normals) {
                nextNormals.push(
                    normals.getX(i + j),
                    normals.getY(i + j),
                    normals.getZ(i + j)
                );
            }

            if (uvs) {
                nextUvs.push(uvs.getX(i + j), uvs.getY(i + j));
            }
        }
    }

    geometry.dispose();

    if (!nextPositions.length) return null;

    const splitGeometry = new THREE.BufferGeometry();
    splitGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nextPositions, 3));

    if (nextNormals.length) {
        splitGeometry.setAttribute("normal", new THREE.Float32BufferAttribute(nextNormals, 3));
    } else {
        splitGeometry.computeVertexNormals();
    }

    if (nextUvs.length) {
        splitGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(nextUvs, 2));
    }

    splitGeometry.computeBoundingBox();
    splitGeometry.computeBoundingSphere();

    return splitGeometry;
}

function SplitBodyColors({ sourceMesh, splitY, upperColor }) {
    const upperLayer = useMemo(() => {
        if (!sourceMesh?.geometry) return null;

        return {
            geometry: buildSplitGeometry(sourceMesh.geometry, (y) => y >= splitY),
            position: sourceMesh.position.clone(),
            quaternion: sourceMesh.quaternion.clone(),
            scale: sourceMesh.scale.clone()
        };
    }, [sourceMesh, splitY]);

    useEffect(() => {
        return () => {
            upperLayer?.geometry?.dispose?.();
        };
    }, [upperLayer]);

    if (!upperLayer?.geometry) return null;

    const materialProps = {
        roughness: 0.5,
        metalness: 0.02,
        envMapIntensity: 0.5,
        clearcoat: 0.08,
        clearcoatRoughness: 0.5,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
    };

    return (
        <mesh
            geometry={upperLayer.geometry}
            position={upperLayer.position}
            quaternion={upperLayer.quaternion}
            scale={upperLayer.scale}
            renderOrder={20}
        >
            <meshPhysicalMaterial color={upperColor} {...materialProps} />
        </mesh>
    );
}

/* =========================
   Sticker (FIXED)
========================= */
const Sticker = memo(function Sticker({
    s,
    scene,
    onClick,
    onEdit,
    onResizeCommit,
    onMove,
    onRotateCommit,
    index,
    setIsDragging,
    isSelected
}) {
    const { camera, size: viewportSize } = useThree();
    const texture = useStickerTexture(s.texture);
    const stickerAspectRatio = Math.max(s.aspectRatio || 1, 0.2);
    const anchorObject = useMemo(
        () => getStickerAnchorObject(scene, s),
        [scene, s.meshId, s.part]
    );
    const targetMeshes = useMemo(
        () => getStickerTargetMeshes(scene, s),
        [scene, s.meshId, s.part]
    );
    const draggableTargetMeshes = useMemo(
        () => getAllStickerTargetMeshes(scene),
        [scene]
    );
    const draggingRef = useRef(false);
    const interactionModeRef = useRef("move");
    const lastPointerRef = useRef({ x: 0, y: 0 });
    const pointerStartRef = useRef({ x: 0, y: 0 });
    const stickerRef = useRef(null);
    const interactionStartRef = useRef({
        size: s.size || 1,
        rotationOffset: s.rotationOffset || 0,
        baseRotation: s.rotation,
        previewRotation: null
    });
    const dragRaycasterRef = useRef(new THREE.Raycaster());
    const [isInteracting, setIsInteracting] = useState(false);
    const [previewRotation, setPreviewRotation] = useState(null);
    const isTopSticker = Math.abs(s.normal?.y || 0) > 0.8;
    const isTopCapSticker =
        s.part === "A" && isOutwardStickerNormalMesh({ name: s.sourceMeshName });
    const effectiveRotation = previewRotation || s.rotation;
    const stickerSize = s.scale * 6 * (s.size || 1);
    const stickerWidth = stickerSize * Math.sqrt(stickerAspectRatio);
    const stickerHeight = stickerSize / Math.sqrt(stickerAspectRatio);
    const offsetPosition = useMemo(() => {
        const nextPosition = s.localPosition.clone();

        if (s.normal) {
            const push = getStickerSurfacePush(s.part, isTopCapSticker, s.normal);
            nextPosition.add(s.normal.clone().multiplyScalar(push));
        }

        return nextPosition;
    }, [
        isTopCapSticker,
        s.localPosition.x,
        s.localPosition.y,
        s.localPosition.z,
        s.normal?.x,
        s.normal?.y,
        s.normal?.z
    ]);

    const stickerGeometry = useMemo(() => {
        const widthSegments = isInteracting
            ? (isTopCapSticker ? 16 : isTopSticker ? 12 : 14)
            : (isTopCapSticker ? 42 : isTopSticker ? 28 : 36);
        const heightSegments = isInteracting
            ? (isTopCapSticker ? 16 : isTopSticker ? 12 : 10)
            : (isTopCapSticker ? 34 : isTopSticker ? 28 : 22);
        const geometry = new THREE.PlaneGeometry(stickerWidth, stickerHeight, widthSegments, heightSegments);

        if (!anchorObject || !targetMeshes.length) {
            return geometry;
        }

        const positions = geometry.attributes.position;
        const vertex = new THREE.Vector3();
        const raycaster = new THREE.Raycaster();
        const quaternion = new THREE.Quaternion().setFromEuler(effectiveRotation);
        const stickerMatrix = new THREE.Matrix4().compose(
            offsetPosition.clone(),
            quaternion,
            new THREE.Vector3(1, 1, 1)
        );
        const inverseStickerMatrix = stickerMatrix.clone().invert();
        const castNormal = s.normal.clone().normalize();
        const castDistance = Math.max(Math.max(stickerWidth, stickerHeight) * (isTopSticker ? 1.25 : 1.6), isTopSticker ? 0.18 : 0.35);
        const surfaceLift = getStickerProjectionLift(s.part, isTopCapSticker, s.normal);
        const minProjectedZ = isTopSticker ? surfaceLift * 0.3 : -Infinity;
        const topExtraLift = isTopSticker ? surfaceLift * 0.15 : 0;

        for (let i = 0; i < positions.count; i += 1) {
            vertex.fromBufferAttribute(positions, i);
            const samplePoint = vertex.clone().applyMatrix4(stickerMatrix);
            const worldOrigin = anchorObject.localToWorld(
                samplePoint.clone().add(castNormal.clone().multiplyScalar(castDistance))
            );
            const worldTarget = anchorObject.localToWorld(samplePoint.clone());
            const worldDirection = worldTarget.clone().sub(worldOrigin).normalize();

            raycaster.set(worldOrigin, worldDirection);
            const hit = pickValidStickerHit(
                raycaster.intersectObjects(targetMeshes, false),
                {
                    requireUpward: isTopSticker,
                    rayDirection: worldDirection,
                    part: s.part
                }
            );

            if (!hit?.point) continue;

            const hitWorldNormal = getResolvedWorldFaceNormal(hit) || getWorldFaceNormal(hit);
            if (!hitWorldNormal) continue;

            const liftedLocalPoint = anchorObject.worldToLocal(
                hit.point.clone().add(hitWorldNormal.multiplyScalar(surfaceLift))
            );
            const projectedVertex = liftedLocalPoint.applyMatrix4(inverseStickerMatrix);
            positions.setXYZ(
                i,
                projectedVertex.x,
                projectedVertex.y,
                Math.max(projectedVertex.z + topExtraLift, minProjectedZ)
            );
        }

        positions.needsUpdate = true;
        geometry.computeVertexNormals();

        return geometry;
    }, [
        isInteracting,
        isTopCapSticker,
        isTopSticker,
        anchorObject,
        targetMeshes,
        offsetPosition.x,
        offsetPosition.y,
        offsetPosition.z,
        s.normal?.x,
        s.normal?.y,
        s.normal?.z,
        effectiveRotation.x,
        effectiveRotation.y,
        effectiveRotation.z,
        stickerHeight,
        stickerWidth
    ]);

    const selectionGeometry = useMemo(
        () => (isSelected ? new THREE.PlaneGeometry(stickerWidth * 1.02, stickerHeight * 1.02) : null),
        [isSelected, stickerHeight, stickerWidth]
    );
    useEffect(() => {
        return () => {
            stickerGeometry.dispose();
            selectionGeometry?.dispose();
        };
    }, [selectionGeometry, stickerGeometry]);

    if (!anchorObject || !targetMeshes.length || !texture) return null;

    const beginInteraction = (e, mode) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        onClick?.();
        interactionModeRef.current = mode;
        lastPointerRef.current = { x: e.clientX ?? 0, y: e.clientY ?? 0 };
        pointerStartRef.current = { x: e.clientX ?? 0, y: e.clientY ?? 0 };
        interactionStartRef.current = {
            size: s.size || 1,
            rotationOffset: s.rotationOffset || 0,
            baseRotation: stabilizeRotationFromReference(
                getBaseStickerRotation(s.rotation, s.normal, s.rotationOffset || 0),
                s.normal,
                s.rotation,
                s.rotationOffset || 0
            ),
            baseQuaternion: stickerRef.current?.quaternion.clone() || new THREE.Quaternion().setFromEuler(s.rotation),
            previewMove: null,
            resizeStartDistance: 0
        };
        setPreviewRotation(null);

        if (mode === "resize" && stickerRef.current) {
            const worldCenter = stickerRef.current.getWorldPosition(new THREE.Vector3());
            const projected = worldCenter.project(camera);
            const centerX = ((projected.x + 1) * 0.5) * viewportSize.width;
            const centerY = ((-projected.y + 1) * 0.5) * viewportSize.height;
            interactionStartRef.current.resizeStartDistance = Math.max(
                12,
                Math.hypot((e.clientX ?? centerX) - centerX, (e.clientY ?? centerY) - centerY)
            );
        }

        draggingRef.current = true;
        setIsInteracting(true);
        setIsDragging?.(true);
        document.body.style.cursor = mode === "move" ? "grabbing" : mode === "rotate" ? "crosshair" : "nwse-resize";
        e.target.setPointerCapture(e.pointerId);
    };

    const updateInteraction = (e) => {
        if (!draggingRef.current) return;

        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        const dx = (e.clientX ?? 0) - lastPointerRef.current.x;
        lastPointerRef.current = { x: e.clientX ?? 0, y: e.clientY ?? 0 };

        if (interactionModeRef.current === "resize") {
            const worldCenter = stickerRef.current?.getWorldPosition(new THREE.Vector3());
            if (!worldCenter) return;

            const projected = worldCenter.project(camera);
            const centerX = ((projected.x + 1) * 0.5) * viewportSize.width;
            const centerY = ((-projected.y + 1) * 0.5) * viewportSize.height;
            const currentDistance = Math.max(
                12,
                Math.hypot((e.clientX ?? centerX) - centerX, (e.clientY ?? centerY) - centerY)
            );
            const distanceRatio = currentDistance / Math.max(interactionStartRef.current.resizeStartDistance || 12, 12);
            const nextSize = Math.max(
                0.3,
                Math.min(3, interactionStartRef.current.size * distanceRatio)
            );
            const scaleFactor = nextSize / Math.max(interactionStartRef.current.size, 0.0001);

            if (stickerRef.current) {
                stickerRef.current.scale.setScalar(scaleFactor);
            }

            interactionStartRef.current.previewSize = nextSize;
            return;
        }

        if (interactionModeRef.current === "rotate") {
            const totalDx = (e.clientX ?? 0) - pointerStartRef.current.x;
            const nextRotationOffset = interactionStartRef.current.rotationOffset - totalDx * 0.015;
            const deltaAngle = nextRotationOffset - interactionStartRef.current.rotationOffset;
            const previewQuaternion = applyRotationOffsetQuaternion(
                interactionStartRef.current.baseQuaternion,
                s.normal,
                deltaAngle
            );

            if (stickerRef.current) {
                stickerRef.current.quaternion.copy(previewQuaternion);
                interactionStartRef.current.previewRotation = stickerRef.current.rotation.clone();
                setPreviewRotation(stickerRef.current.rotation.clone());
            }

            interactionStartRef.current.previewRotationOffset = nextRotationOffset;
            return;
        }

        const referenceVisibleRotation =
            stickerRef.current?.rotation?.clone() ||
            applyRotationOffset(
                interactionStartRef.current.previewMove?.rotation ||
                interactionStartRef.current.baseRotation ||
                getBaseStickerRotation(s.rotation, s.normal, s.rotationOffset || 0),
                interactionStartRef.current.previewMove?.normal || s.normal,
                s.rotationOffset || 0
            );
        const referenceNormal =
            interactionStartRef.current.previewMove?.normal ||
            s.normal;

        dragRaycasterRef.current.ray.origin.copy(e.ray.origin);
        dragRaycasterRef.current.ray.direction.copy(e.ray.direction);
        const hit = pickValidStickerHit(
            dragRaycasterRef.current.intersectObjects(draggableTargetMeshes, false),
            {
                rayDirection: e.ray.direction
            }
        );

        if (!hit?.point || !hit.face) return;

        const nextTransform = getStickerTransformFromHit(
            scene,
            hit,
            referenceVisibleRotation,
            s.rotationOffset || 0,
            referenceNormal
        );
        if (!nextTransform) return;
        const previewRotation = applyRotationOffset(
            nextTransform.rotation,
            nextTransform.normal,
            s.rotationOffset || 0
        );

        if (stickerRef.current) {
            if (nextTransform.stickerAnchor && stickerRef.current.parent !== nextTransform.stickerAnchor) {
                nextTransform.stickerAnchor.add(stickerRef.current);
            }

            stickerRef.current.position.copy(nextTransform.localPosition);
            stickerRef.current.rotation.copy(previewRotation);
        }

        interactionStartRef.current.previewMove = {
            part: nextTransform.part,
            meshId: nextTransform.meshId,
            sourceMeshName: nextTransform.sourceMeshName,
            localPosition: nextTransform.localPosition,
            normal: nextTransform.normal,
            rotation: nextTransform.rotation
        };
    };

    const endInteraction = (e) => {
        if (!draggingRef.current) return;

        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        draggingRef.current = false;
        interactionModeRef.current = "move";
        setIsInteracting(false);
        setIsDragging?.(false);
        document.body.style.cursor = "grab";
        setPreviewRotation(null);

        if (interactionStartRef.current.previewSize !== undefined) {
            onResizeCommit?.(index, interactionStartRef.current.previewSize);
            interactionStartRef.current.previewSize = undefined;
        }

        if (interactionStartRef.current.previewRotationOffset !== undefined) {
            onRotateCommit?.(
                index,
                interactionStartRef.current.previewRotationOffset,
                interactionStartRef.current.previewRotation || stickerRef.current?.rotation?.clone() || s.rotation
            );
            interactionStartRef.current.previewRotationOffset = undefined;
            interactionStartRef.current.previewRotation = null;
        }

        if (interactionStartRef.current.previewMove) {
            onMove?.(index, interactionStartRef.current.previewMove);
            interactionStartRef.current.previewMove = null;
        }

        if (stickerRef.current) {
            stickerRef.current.scale.setScalar(1);
        }

        try {
            e.target.releasePointerCapture(e.pointerId);
        } catch {
            // Ignore release errors from nested handle meshes.
        }
    };

    return (
        <mesh
            renderOrder={999}
            position={offsetPosition}
            rotation={effectiveRotation}
            onPointerMove={updateInteraction}
            onPointerUp={endInteraction}
            onPointerDown={(e) => {
                beginInteraction(e, "move");
            }}
            onClick={(e) => {
                if (!onClick) return;
                e.stopPropagation();
                onClick();
            }}
            onDoubleClick={(e) => {
                if (!onEdit) return;
                e.stopPropagation();
                e.nativeEvent?.stopImmediatePropagation?.();
                onEdit();
            }}
            onPointerOver={() => {
                document.body.style.cursor = "grab";
            }}
            onPointerOut={() => {
                document.body.style.cursor = "";
            }}
            ref={(ref) => {
                stickerRef.current = ref;
                if (ref && anchorObject && ref.parent !== anchorObject) {
                    anchorObject.add(ref);
                }
            }}
        >
            <primitive object={stickerGeometry} attach="geometry" />
            <meshBasicMaterial
                transparent
                map={texture}
                alphaTest={0.5}
                depthWrite={false}
                depthTest={false}
                side={THREE.FrontSide}
                opacity={isSelected ? 0.95 : 1}
            />
            {isSelected && selectionGeometry && (
                <mesh position={[0, 0, 0.0006]}>
                    <primitive object={selectionGeometry} attach="geometry" />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.04}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
            {isSelected && (
                <group position={[0, 0, 0.003]}>
                    {[
                        [-stickerWidth * 0.54, stickerHeight * 0.54, 0, stickerWidth * 0.54, stickerHeight * 0.54, 0],
                        [-stickerWidth * 0.54, -stickerHeight * 0.54, 0, stickerWidth * 0.54, -stickerHeight * 0.54, 0],
                        [-stickerWidth * 0.54, -stickerHeight * 0.54, 0, -stickerWidth * 0.54, stickerHeight * 0.54, 0],
                        [stickerWidth * 0.54, -stickerHeight * 0.54, 0, stickerWidth * 0.54, stickerHeight * 0.54, 0],
                        [0, stickerHeight * 0.54, 0, 0, stickerHeight * 0.72, 0]
                    ].map((points, borderIndex) => (
                        <Line
                            key={borderIndex}
                            points={[
                                [points[0], points[1], points[2]],
                                [points[3], points[4], points[5]]
                            ]}
                            color="#2f2623"
                            transparent
                            opacity={0.72}
                            dashed
                            dashSize={Math.min(stickerWidth, stickerHeight) * 0.08}
                            gapSize={Math.min(stickerWidth, stickerHeight) * 0.05}
                            lineWidth={1}
                            depthWrite={false}
                            depthTest={false}
                        />
                    ))}

                    {[
                        [-stickerWidth * 0.54, -stickerHeight * 0.54, 0.0005],
                        [stickerWidth * 0.54, -stickerHeight * 0.54, 0.0005],
                        [-stickerWidth * 0.54, stickerHeight * 0.54, 0.0005],
                        [stickerWidth * 0.54, stickerHeight * 0.54, 0.0005],
                        [0, stickerHeight * 0.72, 0.0005]
                    ].map((position, handleIndex) => (
                        <mesh
                            key={handleIndex}
                            position={position}
                            onPointerDown={(e) => beginInteraction(e, handleIndex === 4 ? "rotate" : "resize")}
                            onPointerMove={updateInteraction}
                            onPointerUp={endInteraction}
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                document.body.style.cursor = handleIndex === 4 ? "crosshair" : "nwse-resize";
                            }}
                            onPointerOut={(e) => {
                                e.stopPropagation();
                                if (!draggingRef.current) {
                                    document.body.style.cursor = "";
                                }
                            }}
                        >
                            <planeGeometry
                                args={[
                                    Math.max(Math.min(stickerWidth, stickerHeight) * 0.2, 0.42),
                                    Math.max(Math.min(stickerWidth, stickerHeight) * 0.2, 0.42)
                                ]}
                            />
                            <meshBasicMaterial
                                color="#ffffff"
                                transparent
                                opacity={0.001}
                                depthWrite={false}
                                depthTest={false}
                                side={THREE.DoubleSide}
                            />
                            <mesh position={[0, 0, 0.0003]}>
                                <ringGeometry
                                    args={[
                                        Math.max(Math.min(stickerWidth, stickerHeight) * 0.035, 0.06),
                                        Math.max(Math.min(stickerWidth, stickerHeight) * 0.06, 0.1),
                                        24
                                    ]}
                                />
                                <meshBasicMaterial
                                    color="#ffffff"
                                    transparent
                                    opacity={0.95}
                                    depthWrite={false}
                                    depthTest={false}
                                    side={THREE.DoubleSide}
                                />
                            </mesh>
                        </mesh>
                    ))}
                </group>
            )}
        </mesh>
    );
}, (prev, next) => {
    return (
        prev.scene === next.scene &&
        prev.isSelected === next.isSelected &&
        prev.index === next.index &&
        prev.s === next.s
    );
});

/* =========================
   Capsule Model
========================= */
export function CapsuleModel({
    mode = "edit", // "edit" | "sticker"
    setIsDragging,
    selectedPart,
    topColor,
    ringColor,
    bottomColor,
    setSelectedPart,
    stickers = [],
    setStickers = () => { },
    placingSticker = null,
    setPlacingSticker = () => { },
    topLabel = "",
    bodyLabel = "",
    onTopAreaInfo = () => { },
    selectedStickerIndex,
    setSelectedStickerIndex,
    onEditPhotoSticker = () => { },
    onEditTextSticker = () => { }
}) {

    const { scene } = useGLTF(assetUrl("models/capsule(Split).glb"));
    const topMeshes = useRef([]);
    const ringMeshes = useRef([]);
    const bottomMeshes = useRef([]);
    const [meshGroups, setMeshGroups] = useState({
        top: [],
        ring: [],
        bottom: []
    });
    const isStickerTarget = (obj) => Boolean(obj?.userData?.stickerTarget);

    /* ===== INIT ===== */
    useEffect(() => {
        const nextTopMeshes = [];
        const nextRingMeshes = [];
        const nextBottomMeshes = [];

        scene.traverse((child) => {
            if (!child.isMesh) return;

            child.material = Array.isArray(child.material)
                ? child.material.map((m) => m.clone())
                : child.material.clone();

            const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

            materials.forEach((mat) => {
                if (!mat) return;

                if ("roughness" in mat && mat.roughness !== undefined) {
                    mat.roughness = 0.5;
                }

                if ("metalness" in mat && mat.metalness !== undefined) {
                    mat.metalness = 0.02;
                }

                if ("envMapIntensity" in mat && mat.envMapIntensity !== undefined) {
                    mat.envMapIntensity = 0.5;
                }

                if ("clearcoat" in mat && mat.clearcoat !== undefined) {
                    mat.clearcoat = 0.08;
                }

                if ("clearcoatRoughness" in mat && mat.clearcoatRoughness !== undefined) {
                    mat.clearcoatRoughness = 0.5;
                }
            });

            if (
                child.name === "Inner_CoreTop" ||
                child.name === "S_Top_Inner_Core" ||
                child.name === "Top_Inner_Core"
            ) {
                if (isOutwardStickerNormalMesh(child)) {
                    child.userData.forceOutwardStickerNormal = true;

                    materials.forEach((mat) => {
                        if (!mat) return;
                        mat.side = THREE.DoubleSide;
                        mat.needsUpdate = true;
                    });
                }

                nextTopMeshes.push(child);
                child.userData.part = "A";
                child.userData.stickerTarget = true;
            }

            if (child.name === "Ring") {
                child.geometry = child.geometry.clone();
                child.geometry.computeVertexNormals();
                child.geometry.normalizeNormals();

                materials.forEach((mat) => {
                    if (!mat) return;

                    if ("roughness" in mat && mat.roughness !== undefined) {
                        mat.roughness = 0.82;
                    }

                    if ("metalness" in mat && mat.metalness !== undefined) {
                        mat.metalness = 0;
                    }

                    if ("envMapIntensity" in mat && mat.envMapIntensity !== undefined) {
                        mat.envMapIntensity = 0.18;
                    }

                    if ("clearcoat" in mat && mat.clearcoat !== undefined) {
                        mat.clearcoat = 0;
                    }

                    if ("clearcoatRoughness" in mat && mat.clearcoatRoughness !== undefined) {
                        mat.clearcoatRoughness = 1;
                    }

                    mat.needsUpdate = true;
                });

                nextRingMeshes.push(child);
                child.userData.part = "R";
            }

            if (child.name === "Inner_CoreButtom") {
                nextBottomMeshes.push(child);
                child.userData.part = "B";
                child.userData.stickerTarget = true;
                child.visible = true;
            }

            // 🔥 สำคัญ: ปิด raycast ของแก้ว
            if (child.name.includes("Glass")) {
                materials.forEach((mat) => {
                    mat.transparent = true;
                    mat.opacity = 0.22;

                    if ("roughness" in mat && mat.roughness !== undefined) {
                        mat.roughness = 0.03;
                    }

                    if ("metalness" in mat && mat.metalness !== undefined) {
                        mat.metalness = 0;
                    }

                    if ("transmission" in mat && mat.transmission !== undefined) {
                        mat.transmission = 0;
                    }

                    if ("thickness" in mat && mat.thickness !== undefined) {
                        mat.thickness = 0;
                    }

                    if ("ior" in mat && mat.ior !== undefined) {
                        mat.ior = 1.45;
                    }

                    if ("envMapIntensity" in mat && mat.envMapIntensity !== undefined) {
                        mat.envMapIntensity = 0.95;
                    }

                    if ("clearcoat" in mat && mat.clearcoat !== undefined) {
                        mat.clearcoat = 1;
                    }

                    if ("clearcoatRoughness" in mat && mat.clearcoatRoughness !== undefined) {
                        mat.clearcoatRoughness = 0.03;
                    }

                    if ("reflectivity" in mat && mat.reflectivity !== undefined) {
                        mat.reflectivity = 0.9;
                    }
                });

                // ❌ ห้ามใช้ raycast null อย่างเดียว
                child.userData.ignore = true; // ✅ ใส่อันนี้แทน
                child.raycast = () => null;
            }
        });
        topMeshes.current = nextTopMeshes;
        ringMeshes.current = nextRingMeshes;
        bottomMeshes.current = nextBottomMeshes;
        setMeshGroups({
            top: nextTopMeshes,
            ring: nextRingMeshes,
            bottom: nextBottomMeshes
        });
    }, [scene]);

    /* ===== COLOR ===== */
    useEffect(() => {
        const applyColor = (mesh, color) => {
            const mats = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];

            mats.forEach((mat) => {
                if (mat.color) mat.color.set(color);
            });
        };

        topMeshes.current.forEach(m => applyColor(m, topColor));
        ringMeshes.current.forEach(m => applyColor(m, ringColor));
        bottomMeshes.current.forEach(m => applyColor(m, bottomColor));
    }, [topColor, ringColor, bottomColor]);

    useEffect(() => {
        const applyStickerModeHint = (meshes, emissiveColor, intensity) => {
            meshes.forEach((mesh) => {
                const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                mats.forEach((mat) => {
                    if (!mat?.emissive) return;
                    mat.emissive.set(emissiveColor);
                    mat.emissiveIntensity = intensity;
                });
            });
        };

        if (mode === "sticker") {
            applyStickerModeHint(topMeshes.current, "#ffffff", 0.02);
            applyStickerModeHint(ringMeshes.current, "#000000", 0);
            applyStickerModeHint(bottomMeshes.current, "#ffd7a8", 0.2);
            return;
        }

        applyStickerModeHint(topMeshes.current, "#000000", 0);
        applyStickerModeHint(ringMeshes.current, "#000000", 0);
        applyStickerModeHint(bottomMeshes.current, "#000000", 0);
    }, [mode]);

    const handlePlaceSticker = (e) => {
        if (!placingSticker) return;

        e.stopPropagation();

        const hit = e.intersections.find((hit) => {
            let obj = hit.object;
            if (obj?.userData?.ignore) return false;

            while (obj && !isStickerTarget(obj)) obj = obj.parent;
            if (!obj || !isStickerTarget(obj) || !hit.face) return false;

            const worldNormal = getResolvedWorldFaceNormal(hit) || getWorldFaceNormal(hit);
            if (!worldNormal) return false;
            if (!isOuterStickerSurfaceHit(hit)) return false;
            if (obj.userData?.part === "B" && !isBodyOuterWallHit(hit)) return false;

            // For the top, only allow stickers on upward-facing surfaces.
            if (obj.userData?.part === "A" && worldNormal.y < 0.45) {
                return false;
            }

            return true;
        });

        if (!hit) return;

        let obj = hit.object;
        while (obj && !isStickerTarget(obj)) obj = obj.parent;

        if (!obj || !hit.face) return;

        const nextTransform = getStickerTransformFromHit(scene, hit);
        if (!nextTransform) return;
        const worldNormal = getResolvedWorldFaceNormal(hit) || getWorldFaceNormal(hit);
        if (!worldNormal) return;
        const isTopSurface = nextTransform.part === "A" && worldNormal.y > 0.45;
        const stickerPayload = typeof placingSticker === "string"
            ? { texture: placingSticker, aspectRatio: 1 }
            : placingSticker;
        const aspectRatio = Math.max(stickerPayload.aspectRatio || 1, 0.2);
        const normalizedBaseScale = 1 / Math.sqrt(Math.max(aspectRatio, 1 / aspectRatio));
        const baseScale = isTopSurface ? 1.15 : 2;

        setStickers(prev => {
            const nextSticker = {
                part: nextTransform.part,
                meshId: nextTransform.meshId,
                sourceMeshName: nextTransform.sourceMeshName,
                localPosition: nextTransform.localPosition,
                rotation: nextTransform.rotation,
                rotationOffset: 0,
                normal: nextTransform.normal,
                scale: baseScale * normalizedBaseScale,
                size: 1,
                texture: stickerPayload.texture,
                aspectRatio,
                kind: stickerPayload.kind || "sticker",
                photoEdit: stickerPayload.photoEdit || null,
                textEdit: stickerPayload.textEdit || null
            };
            const nextStickers = [...prev, nextSticker];
            setSelectedStickerIndex?.(nextStickers.length - 1);
            return nextStickers;
        });

        setPlacingSticker(null);
    };

    /* ===== RENDER ===== */
    const topLabelMesh =
        meshGroups.top.find((mesh) => mesh.name === "Top_Inner_Core") ||
        meshGroups.top.find((mesh) => mesh.name === "S_Top_Inner_Core") ||
        meshGroups.top[0];

    return (
        <>
            <group position={[0, -0.7, 0]} scale={2.02}>
                <primitive
                    object={scene}
                    onClick={(e) => {
                        e.stopPropagation();

                        if (isStickerObject(e.object)) {
                            return;
                        }

                        setSelectedStickerIndex?.(null);

                        // ⭐ 1. ถ้ามี sticker → แปะก่อนเสมอ
                        if (placingSticker) {
                            handlePlaceSticker(e);
                            return; // 🔥 สำคัญมาก
                        }

                        // 🎨 2. ไม่มี sticker → ค่อยเลือกสี
                        if (mode === "edit") {
                            for (let hit of e.intersections) {
                                let obj = hit.object;
                                while (obj && !obj.userData?.part) obj = obj.parent;

                                if (obj && obj.userData?.part) {
                                    setSelectedPart(obj.userData.part);
                                    break;
                                }
                            }
                        }
                    }}
                    onPointerMissed={() => {
                        setIsDragging?.(false);
                        setSelectedStickerIndex?.(null);
                    }}
                />
                <TopLabel mesh={topLabelMesh} text={topLabel} />
                <SplitBodyColors
                    sourceMesh={meshGroups.bottom[0]}
                    splitY={5.5}
                    upperColor={topColor}
                />
                <BodyLabel mesh={meshGroups.bottom[0]} text={bodyLabel} />
                {stickers.map((s, i) => (
                    <Sticker
                        key={i}
                        s={s}
                        scene={scene}
                        index={i}
                        onClick={() => setSelectedStickerIndex(i)}
                        onEdit={() => {
                            if (s.kind === "photo" && s.photoEdit?.source) {
                                onEditPhotoSticker(i);
                            }

                            if (s.kind === "text" && s.textEdit?.text) {
                                onEditTextSticker(i);
                            }
                        }}
                        onResizeCommit={(i, nextSize) => {
                            setStickers(prev =>
                                prev.map((item, idx) =>
                                    idx === i
                                        ? {
                                            ...item,
                                            size: nextSize
                                        }
                                        : item
                                )
                            );
                        }}
                        onMove={(i, nextTransform) => {
                            setStickers(prev =>
                                prev.map((item, idx) => {
                                    if (idx !== i) return item;

                                    return {
                                        ...item,
                                        part: nextTransform.part,
                                        meshId: nextTransform.meshId,
                                        sourceMeshName: nextTransform.sourceMeshName,
                                        localPosition: nextTransform.localPosition,
                                        normal: nextTransform.normal,
                                        rotation: applyRotationOffset(
                                            nextTransform.rotation,
                                            nextTransform.normal,
                                            item.rotationOffset || 0
                                        )
                                    };
                                })
                            );
                        }}
                        onRotateCommit={(i, nextRotationOffset, nextRotation) => {
                            setStickers(prev =>
                                prev.map((item, idx) => {
                                    if (idx !== i) return item;

                                    return {
                                        ...item,
                                        rotationOffset: nextRotationOffset,
                                        rotation: nextRotation
                                    };
                                })
                            );
                        }}
                        setIsDragging={setIsDragging}
                        isSelected={selectedStickerIndex === i}
                    />
                ))}
            </group>
        </>
    );
}
