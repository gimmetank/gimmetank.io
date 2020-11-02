import * as THREE from './three.module.js';

import Stats from './stats.module.js';

import { OrbitControls } from './OrbitControls.js';
import { FBXLoader } from './FBXLoader.js';


let camera, scene, renderer, stats;

const clock = new THREE.Clock();

let mixer;
let texLoader,mat,tex;
let currentFrame=0;
var plate_mesh;
var camera_traj,index=0;
var video;
var action
//
// function loadTextures(urls, callback) {
//
//     var textures = [];
//
//     var onLoad = function() {
//         callback(null, textures);
//     };
//
//     var onProgress = function() {};
//
//     var onError = function(url) {
//         callback(new Error('Cannot load ' + url));
//     };
//
//     var manager = new THREE.LoadingManager(onLoad, onProgress, onError);
//
//     var loader = new THREE.TextureLoader(manager);
//
//     for (var i=0; i<urls.length; i++) {
//         textures.push(loader.load(urls[i]));
//     }
// }
//
// var urls = [
//     "I:\\InsertIQ\\syntheye\\tiktok_dog_fbx_media\\tiktok_dog_fbx_media\\dog_png000.png",
//     // "I:\\InsertIQ\\syntheye\\tiktok_dog_fbx_media\\tiktok_dog_fbx_media\\dog_png001.png"
// ];

init();
animate();

// function unload()
// {
//     if (video)
//     {
//         video.pause();
//         video.currentTime=0.0;
//         video.remove();
//     }
// }
//
// // window.onbeforeunload=unload();
// window.onunload=unload();


function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    // camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 40000 );
    // camera.position.set( 100, 200, 300 );
    camera.position.set( 600, 800, 1200 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    // scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 200, 40000 );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 2000, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( 0, 2000, 1000 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 1800;
    dirLight.shadow.camera.bottom = - 1000;
    dirLight.shadow.camera.left = - 1200;
    dirLight.shadow.camera.right = 1200;
    scene.add( dirLight );

    // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

    // ground
    // const mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
    const mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );

    // const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
    const grid = new THREE.GridHelper( 20000, 20, 0x000000, 0x000000 );
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add( grid );

    // texLoader = new THREE.TextureLoader();
    video = document.getElementById( 'video' );
    // video.currentTime=0;
    // video.reset();
    // video = document.createElement( 'video' );
    video.src = "img/dog_frames.mp4";
    video.loop=true;
    video.load();
    video.onloadeddata = function() {

        // must call after setting/changing source
        // video.play(); // must call after setting/changing source
        // video.reload();


        // texLoader = new THREE.VideoTexture('img\\dog_frames.mp4');
        texLoader = new THREE.VideoTexture(video);
        texLoader.needsUpdate = true;
        texLoader.minFilter = THREE.LinearFilter;
        texLoader.magFilter = THREE.LinearFilter;
        texLoader.format = THREE.RGBFormat;
        texLoader.crossOrigin = 'anonymous';
        mat = new THREE.MeshBasicMaterial({
            // map: texLoader.load('img\\dog_png000.png')
            // map: texLoader.load('img\\tiktok_dog_fbx_media\\dog_png'+currentFrame.toString().padStart(3, "0")+'.png')
            map: texLoader
        });

        // model
        const loader = new FBXLoader();
        loader.load( 'dog_tiktok_final.fbx', function ( object ) {
            // loader.load( 'Samba Dancing.fbx', function ( object ) {
            mixer = new THREE.AnimationMixer( object );
            // object.traverse( function ( child ) {
            //     if (child.name==='Camera01Screen'){
            //     // if ( child.isMesh ) {
            //         // child.material.map = new THREE.TextureLoader().load('I:\\InsertIQ\\syntheye\\tiktok_dog_fbx_media\\tiktok_dog_fbx_media\\dog_png000.png');
            //
            //         child.castShadow = true;
            //         child.receiveShadow = true;
            //         child.material.needsUpdate = true;
            //         // child.material.map = new THREE.TextureLoader().load('I:\\InsertIQ\\syntheye\\tiktok_dog_fbx_media\\tiktok_dog_fbx_media\\dog_png000.png');
            //         // child.material.map = tex;
            //         child.material = mat;
            //         // child.material.color.set(0xff0000);
            //         child.material.side = THREE.DoubleSide;
            //         plate_mesh=child;
            //     }
            // } );

            scene.add( object );
            plate_mesh=scene.getObjectByName( "Camera01Screen" );
            plate_mesh.castShadow = true;
            plate_mesh.receiveShadow = true;
            plate_mesh.material.needsUpdate = true;
            plate_mesh.material = mat;
            plate_mesh.material.side = THREE.DoubleSide;


            const frame_count = object.animations[0].tracks[0].times.length
            // var camera_traj = scene.getObjectByName( "Camera01" );

            //camera trajectory line
            var geometry = new THREE.BufferGeometry();
            var positions = new Float32Array( frame_count*3 ); // 3 vertices per point
            geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

            var material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth:2 } );
            camera_traj = new THREE.Line( geometry,  material );
            scene.add(camera_traj);

            action = mixer.clipAction( object.animations[ 0 ] );
            video.currentTime=0;
            action.play();
            // video.play();

        });
    };

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 100, 0 );
    controls.update();

    window.addEventListener( 'resize', onWindowResize, false );

    // stats
    stats = new Stats();
    container.appendChild( stats.dom );
    // video.currentTime=mixer.time;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    const delta = clock.getDelta();

    // mat.needsUpdate = true;
    // // tex = texLoader.load('img\\dog_png'+currentFrame.toString().padStart(3, "0")+'.png');
    // mat.map=texLoader.load('img\\dog_png'+currentFrame.toString().padStart(3, "0")+'.png');
    // if (plate_mesh)
    // {
    //     plate_mesh.material.map=texLoader.load('img\\tiktok_dog_fbx_media\\dog_png'+currentFrame.toString().padStart(3, "0")+'.png');
    // }
    if ( mixer )
    {
        mixer.update( delta );

        if (video.currentTime===0)
        {
            video.currentTime=mixer.time;
            // video.load();
            video.play();
            // video.play().then(() => {
            //     video.pause();
            // }).then(() => video.play());
        }

        var pos=mixer.getRoot().children[0].position;
        var dir=mixer.getRoot().children[0].rotation;
        //
        camera_traj.geometry.setDrawRange( 0, index/3+1);
        var positions = camera_traj.geometry.attributes.position.array;
        positions[ index ++ ] = pos.x;
        positions[ index ++ ] = pos.y;
        positions[ index ++ ] = pos.z;
        // camera_traj.geometry.setDrawRange( 0, index/3+1);
        camera_traj.geometry.attributes.position.needsUpdate = true;


        const ray_points = [];
        ray_points.push( new THREE.Vector3( pos.x, pos.y, pos.z ));
        ray_points.push( new THREE.Vector3( pos.x+1000.0*dir.x, pos.y+1000.0*dir.y, pos.z+1000.0*dir.z));

        const geometry = new THREE.BufferGeometry().setFromPoints(ray_points);
        const line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x0000ff } ) );
        scene.add( line );

    }

    renderer.render( scene, camera );




    stats.update();
    // currentFrame++;

}

