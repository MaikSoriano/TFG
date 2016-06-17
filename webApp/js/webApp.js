/**
 * Created by Miguel on 05/06/2016.
 */

var render;
var escena;
var camara;
var blendMesh = null;
var contenedor;
var stats;
<<<<<<< HEAD
var clock = new THREE.Clock();
=======

>>>>>>> parent of afca3d4... aplicación demo terminada


function init()
{

    //Escena
    escena = new THREE.Scene();
    escena.add(new THREE.AmbientLight(0xffffff));

    //Render
    render = new THREE.WebGLRenderer({ antialias: true, alpha: false });
<<<<<<< HEAD
    render.setClearColor("rgb(200, 50, 50)",1);
    render.setPixelRatio( window.devicePixelRatio );
    render.setSize( window.innerWidth, window.innerHeight );
=======
    render.setClearColor("rgb(200, 200, 200)",1);
>>>>>>> parent of afca3d4... aplicación demo terminada
    render.autoClear = true;

    var canvasWidth = 500;
    var canvasHeight = 500;
    render.setSize(canvasWidth, canvasHeight);

    contenedor = document.getElementById("divCanvas");
    contenedor.appendChild(render.domElement);



    stats = new Stats();
    contenedor.appendChild(stats.dom);

<<<<<<< HEAD
    // create the video element
    videoTx = document.createElement( 'video' );
    videoTx.src = "resources/pasillo2.mp4";
    videoTx.width  = 720 ;
    videoTx.height = 482;
    videoTx.load(); // must call after setting/changing source
    //videoTx.play();

    canvasTx = document.createElement( 'canvas' );
    canvasTx.width  = 512 ;
    canvasTx.height = 512;

    canvasImageContext = canvasTx.getContext( '2d' );

    // background color if no video present
    //canvasImageContext.fillStyle = '#550000';
    //canvasImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

    videoTexture = new THREE.Texture(canvasTx);
    //videoTexture.minFilter = THREE.LinearFilter;
    //videoTexture.wrapS = THREE.RepeatWrapping;
    //videoTexture.wrapT = THREE.RepeatWrapping;

    var geometry = new THREE.PlaneGeometry(2048, 1024, 0);
    var material = new THREE.MeshBasicMaterial({ map : videoTexture, depthTest : false, depthWrite : false });
    //Creamos un plano en el canvas que tendrá como textura
    var plane = new THREE.Mesh(geometry, material);
    plane.position.z = -900;

    //escena.add(plane);


=======
>>>>>>> parent of afca3d4... aplicación demo terminada
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

<<<<<<< HEAD
    //Personaje
    personaje = new THREE.BlendCharacter();
    personaje.load( "models/personaje.json", start);
    //personaje.load( "models/correr.json", start);
=======
>>>>>>> parent of afca3d4... aplicación demo terminada
}


function start()
{

<<<<<<< HEAD
    //personaje.rotation.y = Math.PI * -135 / 180;
    //personaje.position.y = -40;
    escena.add(personaje);
=======
    blendMesh.rotation.y = Math.PI * -135 / 180;
    escena.add(blendMesh);
>>>>>>> parent of afca3d4... aplicación demo terminada

    var aspect = window.innerWidth / window.innerHeight;
    var radius = blendMesh.geometry.boundingSphere.radius;

    camara = new THREE.PerspectiveCamera( 45, 1, 1, 10000 );
    camara.position.set( 0.0, radius, radius * 3.5 );
    escena.add(camara);

<<<<<<< HEAD
    personaje.moverEstado = { delante: 0, atras: 0, izquierda: 0, derecha: 0, girarIz: 0, girarDe: 0, velocidad: 0 };
    personaje.play("esperarBueno", 1);

=======
>>>>>>> parent of afca3d4... aplicación demo terminada
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
<<<<<<< HEAD

}

function onWindowResize()
{
    contenedor.canvasWidth = window.innerWidth;
    contenedor.canvasHeight = window.innerHeight;

    camara.aspect = contenedor.canvasWidth / contenedor.canvasHeight;
    camara.updateProjectionMatrix();

    render.setSize( contenedor.canvasWidth, contenedor.canvasHeight );
}

function onKeydown(event)
{
    if ( event.altKey ) {
        return;
    }

    switch ( event.keyCode )
    {

        case 16: /* shift */ this.movementSpeedMultiplier = .1; break;

        case 87: /*W*/ personaje.moverEstado.delante = 1; break;
        case 83: /*S*/ console.log("S pressed"); break;

        case 65: /*A*/ personaje.moverEstado.girarIz = 1; break;
        case 68: /*D*/ personaje.moverEstado.girarDe = 1; break;

    }

    actualizarMov();
}

function onKeyup(event)
{
    switch ( event.keyCode )
    {

        case 16: /* shift */ this.movementSpeedMultiplier = .1; break;

        case 87: /*W*/ personaje.moverEstado.delante = 0; break;
        case 83: /*S*/ console.log("S released"); break;

        case 65: /*A*/ personaje.moverEstado.girarIz = 0; break;
        case 68: /*D*/ personaje.moverEstado.girarDe = 0; break;

    }

    actualizarMov();
}

function actualizarMov()
{
    var velocidadGiro = 0.045;
    var velocidadMovLateral  = 4;
    var velocidadCorrer = 0.03;

    var maxGiro = 0.55;
    var maxPos  = 270;



    if(personaje.rotation.y >= -maxGiro && personaje.rotation.y <= maxGiro)
    {
        personaje.rotation.y += velocidadGiro * (-personaje.moverEstado.girarDe + personaje.moverEstado.girarIz);

        if(personaje.moverEstado.velocidad >0)
        {
            personaje.position.x += -velocidadMovLateral * personaje.rotation.y * personaje.moverEstado.velocidad;
        }

    }

    //Cuando gire demasiado que no siga girando
    if(personaje.rotation.y < -maxGiro)
    {
        personaje.rotation.y = -maxGiro;
    }
    else if(personaje.rotation.y > maxGiro)
    {
        personaje.rotation.y = maxGiro;
    }

    //Cuando llegue a los extremos que no siga moviendose
    if(personaje.position.x <= -maxPos)
    {
        personaje.position.x = -maxPos;
        personaje.rotation.y = 0;
    }
    else if(personaje.position.x >= maxPos)
    {
        personaje.position.x = maxPos;
        personaje.rotation.y = 0;
    }

    //ayuda para volver a mirar al frente
    if(personaje.rotation.y > -0.15 && personaje.rotation.y < 0.15 && personaje.moverEstado.girarDe == 0 && personaje.moverEstado.girarIz == 0)
    {
        personaje.rotation.y = 0;
    }

    if(personaje.moverEstado.delante == 1 && personaje.moverEstado.velocidad <= 1)
    {
        personaje.moverEstado.velocidad += velocidadCorrer;
        personaje.play("correrBueno", personaje.moverEstado.velocidad);
        personaje.play("esperarBueno", 1 - personaje.moverEstado.velocidad);

    }
    else if(personaje.moverEstado.delante == 0 && personaje.moverEstado.velocidad >= 0)
    {
        personaje.moverEstado.velocidad -= velocidadCorrer;
        personaje.play("correrBueno", personaje.moverEstado.velocidad);
        personaje.play("esperarBueno", 1 - personaje.moverEstado.velocidad);
    }

=======
>>>>>>> parent of afca3d4... aplicación demo terminada
}