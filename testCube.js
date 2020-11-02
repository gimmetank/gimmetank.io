import * as THREE from "./three.module.js";
import {OrbitControls} from "./OrbitControls.js";

let scene,renderer,camera;

init();
animate();

function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.set( 100, 200, 300 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 200, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( 0, 200, 100 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = - 100;
    dirLight.shadow.camera.left = - 120;
    dirLight.shadow.camera.right = 120;
    scene.add( dirLight );


    // instantiate a loader
    const loader = new THREE.TextureLoader();

    // load a resource
    loader.load(
        // resource URL
        // 'I:\\InsertIQ\\syntheye\\tiktok_dog_fbx_media\\tiktok_dog_fbx_media\\dog_png000.png',
        'img\\dog_png000.png',
        // onLoad callback
        function ( texture ) {
            // in this example we create the material when the texture is loaded
            const material = new THREE.MeshBasicMaterial( {
                map: texture
            } );
            var geometry = new THREE.BoxGeometry(100, 100, 100);
            // var material = new THREE.MeshLambertMaterial();  // default color is 0xffffff
            var cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        function ( err ) {
            console.error( 'An error happened.' );
        }
    );


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 100, 0 );
    controls.update();

    window.addEventListener( 'resize', onWindowResize, false );
}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );

}
