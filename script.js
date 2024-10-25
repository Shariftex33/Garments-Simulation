let scene, camera, renderer, model, fabricTexture, controls;

function init() {
  // Set up scene, camera, and renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xeeeeee); // Set a light gray background
  document.getElementById('canvasContainer').appendChild(renderer.domElement);
  
  // Position camera
  camera.position.set(0, 0, 3); // Adjust as necessary

  // Initialize OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Strong white light
  directionalLight.position.set(5, 5, 5).normalize(); // Position the light
  scene.add(directionalLight);

  // Event listeners for model and fabric input
  document.getElementById('modelInput').addEventListener('change', loadModelFromFile);
  document.getElementById('fabricInput').addEventListener('change', handleFabricUpload);
  document.getElementById('simulateBtn').addEventListener('click', applyFabricTexture);
}

function loadModelFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileExtension = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = (e) => {
    const contents = e.target.result;

    if (fileExtension === 'obj') {
      // Load OBJ file
      const loader = new THREE.OBJLoader();
      const object = loader.parse(contents);
      addModelToScene(object);
    } else if (fileExtension === 'glb' || fileExtension === 'gltf') {
      // Load GLB/GLTF file
      const gltfLoader = new THREE.GLTFLoader();
      gltfLoader.parse(contents, '', (gltf) => {
        addModelToScene(gltf.scene);
      });
    } else {
      console.error('Unsupported file format');
    }
  };

  // Read the file as text for OBJ and as binary for GLB
  if (fileExtension === 'obj') {
    reader.readAsText(file);
  } else if (fileExtension === 'glb' || fileExtension === 'gltf') {
    reader.readAsArrayBuffer(file);
  }
}

function addModelToScene(object) {
  // Remove previous model, if any
  if (model) scene.remove(model);

  model = object;

  // Normalize geometry if necessary
  model.traverse((child) => {
    if (child.isMesh) {
      child.geometry.computeBoundingBox(); // Compute bounding box
      child.geometry.computeBoundingSphere(); // Compute bounding sphere
      child.scale.set(4, 4, 4);  // Adjust scale as needed
      child.position.set(-1, -3, 0); // Center the model
    }
  });

  scene.add(model);
}

function handleFabricUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    fabricTexture = new THREE.TextureLoader().load(e.target.result, (texture) => {
      console.log("Texture loaded successfully");
    }, undefined, (error) => {
      console.error("Error loading texture:", error);
    });
  };

  if (file) reader.readAsDataURL(file);
}

function applyFabricTexture() {
  if (fabricTexture && model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({ map: fabricTexture });
      }
    });
    console.log("Fabric texture applied."); // Debug log
  } else {
    console.log("Fabric texture or model is missing."); // Debug log
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.update(); 

  // Render the scene
  renderer.render(scene, camera);
}

// Initialize and animate
init();
animate();
