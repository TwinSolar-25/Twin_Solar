let previousMesh = null;
let previousColor = null;
let timeoutColor = null;

scene.onPointerObservable.add((pointerInfo) => {
  if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERPICK) return;

  const pick = pointerInfo.pickInfo;
  const mesh = pick?.pickedMesh;

  if (!pick.hit || !mesh || !mesh.material) return;

  // 🔁 Réinitialiser le précédent mesh s’il y en a un
  if (previousMesh && previousMesh.material && previousColor) {
    previousMesh.material.emissiveColor = previousColor.clone();
    clearTimeout(timeoutColor);
  }

  // ✅ Cloner le matériau si nécessaire
  if (!mesh.material.__wasCloned) {
    mesh.material = mesh.material.clone(`${mesh.name}_clone`);
    mesh.material.__wasCloned = true;
  }

  // 🟡 Sauvegarder l'état actuel
  previousMesh = mesh;
  previousColor = mesh.material.emissiveColor.clone();

  // 🔴 Appliquer une nouvelle couleur temporaire
  mesh.material.emissiveColor = new BABYLON.Color3(1, 0.2, 0.2); // Rouge clair

  // ⏱️ Revenir à la couleur originale après 3 secondes
  timeoutColor = setTimeout(() => {
    if (mesh.material) {
      mesh.material.emissiveColor = previousColor;
      previousMesh = null;
      previousColor = null;
    }
  }, 3000);
});
