import { AmbientLight, Camera, GridHelper, PerspectiveCamera, Scene, WebGLRenderer, BoxGeometry, Mesh, MeshLambertMaterial, DirectionalLight, DirectionalLightHelper, ReinhardToneMapping, SpotLight, SpotLightHelper, HemisphereLight, HemisphereLightHelper, AnimationMixer, Clock, Object3D, MeshBasicMaterial, sRGBEncoding, ACESFilmicToneMapping, Fog } from "./three/build/three.module.js";
import { GLTFLoader } from "./loaders/GLTFLoader.js"

const renderBlog = () => {
    let delta = 0;
    let offset = 0.005;
    const blogScene = new Scene();
    const cameraParent = new Mesh();
    const blogCamera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight);
    cameraParent.position.set(0, 0, 0);
    cameraParent.add(blogCamera);
    blogScene.add(cameraParent);
    blogScene.fog = new Fog(0xccffff, 10, 400)
    blogCamera.position.set(-30, 2.5, 1);
    blogCamera.rotateY(-1.2);

    const light = new DirectionalLight(0xffff00, 1);
    const lightHelper = new DirectionalLightHelper(light);
    // light.castShadow = true;
    light.shadow.bias = 10;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 5000;
    light.shadow.camera.left = -500;
    light.shadow.camera.right = 500;
    light.shadow.camera.top = 500;
    light.shadow.camera.bottom = -500;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.position.set(-10, 10, 10);
    light.rotateX(45);
    light.rotateZ(45);
    blogScene.add(light);

    const hemiLight = new HemisphereLight(0xffff66, 0xffffff, 0.5);
    const hemiLightHelper = new HemisphereLightHelper(hemiLight);
    blogScene.add(hemiLightHelper);
    // blogScene.add(hemiLight);

    const spotLight = new SpotLight(0xffff66, 6, 40, 90);
    const spotLightHelper = new SpotLightHelper(spotLight);
    spotLight.castShadow = true;
    spotLight.shadow.radius = 10;
    spotLight.shadow.blurSamples = 10;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.position.y = 20;
    spotLight.position.z = 5;
    spotLight.rotateX(1);
    // blogScene.add(spotLightHelper);
    blogScene.add(spotLight);

    // blogScene.add(lightHelper);

    const ambientLight = new AmbientLight(0x66ccff, 2);
    blogScene.add(ambientLight);

    const blogRenderer = new WebGLRenderer({ alpha: true });
    blogRenderer.setSize(window.innerWidth, window.innerHeight);
    blogRenderer.shadowMap.enabled = true;
    blogRenderer.toneMapping = ACESFilmicToneMapping;
    blogRenderer.toneMappingExposure = 0.5;
    blogRenderer.outputEncoding = sRGBEncoding;

    const grid = new GridHelper(100, 100);
    // blogScene.add(grid);

    let mixer;
    const gltfLoader = new GLTFLoader();
    gltfLoader.load("./Objects/van.gltf", (gltf) => {
        const root = gltf.scene;
        root.rotateY(3.141593);
        root.scale.set(2, 2, 2);
        root.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                // child.receiveShadow = true;
            }
        })
        blogScene.add(root);
    });
    gltfLoader.load("./Objects/Road.gltf", (gltf) => {
        const root = gltf.scene;
        root.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
        blogScene.add(root);
        mixer = new AnimationMixer(root);
        gltf.animations.forEach(clip => {
            mixer.clipAction(clip).play();
        });
    });
    // const orbit = new OrbitControls(blogCamera, blogRenderer.domElement);

    const blogTab = document.getElementById("blog-tab");
    if (blogTab.getElementsByTagName("canvas")[0]) {
        blogTab.getElementsByTagName("canvas")[0].replaceWith(blogRenderer.domElement);
    }
    else {
        blogTab.appendChild(blogRenderer.domElement);
    }

    const animate = () => {

        if (mixer) mixer.update(delta * 0.25);
        if (delta !== 0) {
            cameraParent.rotation.y += offset
        }
        // orbit.update();
        blogRenderer.render(blogScene, blogCamera);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    window.onscroll = (e) => {
        delta = .01;
        window.clearTimeout(scroll);
        scroll = setTimeout(function () {
            delta = 0;
        }, 100);
    };
}

renderBlog();