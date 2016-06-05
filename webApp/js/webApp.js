/**
 * Created by Miguel on 05/06/2016.
 */

var render;
var escena;
var camara;
var blendMesh = null;
var contenedor;
var stats;



function init()
{

    //Escena
    escena = new THREE.Scene();
    escena.add(new THREE.AmbientLight(0xffffff));

    //Render
    render = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    render.setClearColor("rgb(200, 200, 200)",1);
    render.autoClear = true;

    var canvasWidth = 500;
    var canvasHeight = 500;
    render.setSize(canvasWidth, canvasHeight);

    contenedor = document.getElementById("divCanvas");
    contenedor.appendChild(render.domElement);



    stats = new Stats();
    contenedor.appendChild(stats.dom);

    //Camara
    /*camara = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 1000);
    camara.position.set(0, 0, 0);
    camara.lookAt(escena.position);
    escena.add(camara);*/

    //Personaje
    blendMesh = new THREE.BlendCharacter();
    //blendMesh.load( "models/marine_anims_core.json", start);
    blendMesh.load( "models/correr.js", start);

    //render.render(escena, camara);

}


function start()
{

    blendMesh.rotation.y = Math.PI * -135 / 180;
    escena.add(blendMesh);

    var aspect = window.innerWidth / window.innerHeight;
    var radius = blendMesh.geometry.boundingSphere.radius;

    camara = new THREE.PerspectiveCamera( 45, 1, 1, 10000 );
    camara.position.set( 0.0, radius, radius * 3.5 );
    escena.add(camara);

    animar();
}


function animar()
{
    requestAnimationFrame(animar, render.domElement);
    stats.begin();

    renderEscena();

    stats.end();
}

function renderEscena()
{
    render.render(escena, camara);
}