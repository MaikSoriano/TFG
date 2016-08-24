/**
 * Created by Miguel on 05/06/2016.
 */

var render;
var escena;
var camara;
var arEscena;
var arCamara;
var personaje = null;
var robot = null;
var contenedor;
var stats;
var clock = new THREE.Clock();
var imgSrc = "php/get_pic.php?time=" + new Date().getTime();
var lastCallVideo = 0;
var canvas2d;



function init()
{

    //Escena
    escena = new THREE.Scene();
    arEscena = new THREE.Scene();
    escena.add(new THREE.AmbientLight(0xffffff));

    //Render
    render = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    render.setClearColor("rgb(200, 200, 200)",0.2);
    render.setPixelRatio( window.devicePixelRatio );
    render.setSize( window.innerWidth, window.innerHeight );
    render.autoClear = true;
    render.shadowMap.enabled = true;

    contenedor = document.getElementById("divCanvas");
    contenedor.appendChild(render.domElement);

    contenedor.canvasWidth = window.innerWidth;
    contenedor.canvasHeight = window.innerHeight;
    render.setSize(contenedor.canvasWidth, contenedor.canvasHeight);

    //Canvas 2D para AR
    canvas2d = document.createElement('canvas'); // canvas to draw our video on
    canvas2d.width = contenedor.canvasWidth;
    canvas2d.height = contenedor.canvasHeight;
    contenedor.appendChild(canvas2d);


    stats = new Stats();
    contenedor.appendChild(stats.dom);



    //Plano y textura para el video
    videoTexture = new THREE.TextureLoader().load(imgSrc);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.wrapS = THREE.RepeatWrapping;
    videoTexture.wrapT = THREE.RepeatWrapping;

    var geometry = new THREE.PlaneGeometry(1390, 638, 0);
    var material = new THREE.MeshBasicMaterial({ map : videoTexture, depthTest : false, depthWrite : false });
    //Creamos un plano en el canvas que tendrá como textura
    plane = new THREE.Mesh(geometry, material);
    plane.position.z = -450;
    plane.position.y = 90;
    //plane.scale.x = contenedor.canvasWidth;
    //plane.scale.y = contenedor.canvasHeight;

    escena.add(plane);

    //Suelo para sombra
    var geometriaSuelo = new THREE.PlaneGeometry(1000, 1000, 0);
    var materialSuelo = new THREE.ShadowMaterial(); //Cambiar el tipo de material si se quiere añadir suelo en RA
    materialSuelo.opacity = 0.2;
    //Creamos un plano en el canvas que tendrá como textura
    suelo = new THREE.Mesh(geometriaSuelo, materialSuelo);
    suelo.position.y = -23;
    suelo.rotation.x = 29.8; //[29.6, 30]
    suelo.receiveShadow = true;
    escena.add(suelo);

    //Luz
    sunlight = new THREE.DirectionalLight();
    sunlight.position.set(0, 200, 0);
    sunlight.intensity = 0.2;
    sunlight.castShadow = true;
    var intensidad = 300;
    sunlight.shadow.camera.bottom = -intensidad;
    sunlight.shadow.camera.left = -intensidad;
    sunlight.shadow.camera.top = intensidad;
    sunlight.shadow.camera.right = intensidad;
    escena.add(sunlight);


    //Listener
    window.addEventListener('resize',  onWindowResize, false);
    window.addEventListener('keydown', onKeydown,      false);
    window.addEventListener('keyup',   onKeyup,        false);

    //Robot
    robot = new Robot();


    //Personaje
    personaje = new THREE.BlendCharacter();
    personaje.load( "models/personaje.json", start);
    //personaje.load( "models/correr.json", start);

}


function start()
{

    //personaje.rotation.y = Math.PI * -135 / 180;
    personaje.position.y = -30;
    personaje.castShadow = true;
    escena.add(personaje);

    var aspect = contenedor.canvasWidth / contenedor.canvasHeight;
    var radius = personaje.geometry.boundingSphere.radius;

    arCamara = new THREE.Camera();
    camara = new THREE.PerspectiveCamera( 45, aspect, 1, 10000 );
    camara.position.set( 0.0, radius, radius * 3.5 );
    escena.add(camara);
    arEscena.add(arCamara);



    personaje.moverEstado = { delante: 0, atras: 0,
                            izquierda: 0, derecha: 0,
                            saltando: 0,velocidad: 0,
                            girarIz: 0, girarDe: 0};
    personaje.pesoAnimacion = {esperar:1, correr: 0, salto: 0};
    personaje.mixer.clipAction("saltoBueno").timeScale = 2;
    personaje.mixer.clipAction("correrBueno").timeScale = 2;
    personaje.play("esperarBueno", 1);


    manejadorTouch();
    animar();
    onWindowResize();
    //alerta();
}


function animar()
{
    requestAnimationFrame(animar, render.domElement);
    stats.begin();


    renderEscena();

    actualizarMov();
    var delta = clock.getDelta();
    personaje.update(delta);
    robot.comprobarDistancia();

    stats.end();
}

function renderEscena()
{
    actualizarVideo();

    if(canvas2d.changed)
        detectarMarcadores();

    render.autoClear = false;
    render.clear();

    render.render(escena, camara);
    render.render(arEscena, arCamara);

}

function onWindowResize()
{
    contenedor.canvasWidth = window.innerWidth-5;
    contenedor.canvasHeight = window.innerHeight-5;

    camara.aspect = contenedor.canvasWidth / contenedor.canvasHeight;

    camara.updateProjectionMatrix();


    render.setSize( contenedor.canvasWidth, contenedor.canvasHeight );
    //plane.scale.x = contenedor.canvasWidth;
    //plane.scale.y = contenedor.canvasHeight;

    canvas2d.width = contenedor.canvasWidth;
    canvas2d.height = contenedor.canvasHeight;
    inicializarDetectorMarcadores(canvas2d, contenedor.canvasWidth, contenedor.canvasHeight, true);

}

function onKeydown(event)
{
    if ( event.altKey ) {
        return;
    }

    switch ( event.keyCode )
    {

        case 87: /*W*/ personaje.moverEstado.delante = 1; break;
        case 83: /*S*/ console.log("S pressed");  break;

        case 65: /*A*/ personaje.moverEstado.izquierda = 1; break;
        case 68: /*D*/ personaje.moverEstado.derecha = 1; break;

        case 81: /*Q*/ personaje.moverEstado.girarIz = 1; break;
        case 69: /*E*/ personaje.moverEstado.girarDe = 1; break;

        case 32: /*SPACE*/
            if(personaje.moverEstado.saltando == 0)
            {
                personaje.moverEstado.saltando = 1;
            }
            break;

    }

    actualizarMov();
}

function onKeyup(event)
{
    switch ( event.keyCode )
    {

        case 87: /*W*/ personaje.moverEstado.delante = 0; break;
        case 83: /*S*/ console.log("S released"); break;

        case 65: /*A*/ personaje.moverEstado.izquierda = 0; break;
        case 68: /*D*/ personaje.moverEstado.derecha = 0; break;

        case 81: /*Q*/ personaje.moverEstado.girarIz = 0; break;
        case 69: /*E*/ personaje.moverEstado.girarDe = 0; break;

    }

    actualizarMov();
}

function actualizarMov()
{
    var velocidadGiro = 0.045;
    var velocidadMovLateral  = 4;
    var velocidadSalto = 1.3;
    var velocidadCambioAnimación = 0.05;

    var maxGiro = 0.55;
    var maxPos  = 250;

    //COMPROBACIONES ROBOT
    //Si no puede ir hacia alante
    if(robot.poderAndar.front == false)
    {
        personaje.moverEstado.delante = 0;
    }
    //Si no puede girar hacia la derecha
    if(robot.poderAndar.right == false)
    {
        personaje.moverEstado.right = 0;
    }
    //Si no puede girar hacia la izquierda
    if(robot.poderAndar.left == false)
    {
        personaje.moverEstado.left = 0;
    }

    //Cuando se complete la animación de salto cambiamos el estado
    if(personaje.mixer.clipAction("saltoBueno").time >= personaje.mixer.clipAction("saltoBueno")._clip.duration-1)
    {
        robot.parar();
        personaje.moverEstado.saltando = 0.5;
    }


    //Si estamos dentro del angulo de giro se rota hacia un lado u otro y se mueve en X si se da el caso
    if(personaje.rotation.y >= -maxGiro && personaje.rotation.y <= maxGiro)
    {
        personaje.rotation.y += velocidadGiro * (-personaje.moverEstado.derecha + personaje.moverEstado.izquierda);

        if(personaje.pesoAnimacion.correr > 0) //Si no está parado se mueve en el eje X
        {
            personaje.position.x += -velocidadMovLateral * personaje.rotation.y * personaje.pesoAnimacion.correr;
        }
        else if(personaje.pesoAnimacion.salto > 0) //Si se esta saltando y girado tambien se mueve en el X
        {
            personaje.position.x += -velocidadMovLateral * personaje.rotation.y * personaje.pesoAnimacion.salto;
        }
    }


    //Cuando rote demasiado que no siga rotando a no ser que este girando el robot
    if(personaje.rotation.y < -maxGiro && personaje.moverEstado.girarIz == 0)
    {
        personaje.rotation.y = -maxGiro;
    }
    else if(personaje.rotation.y > maxGiro && personaje.moverEstado.girarDe == 0)
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
    if(personaje.rotation.y > -0.15 && personaje.rotation.y < 0.15 && personaje.moverEstado.derecha == 0 && personaje.moverEstado.izquierda == 0)
    {
        personaje.rotation.y = 0;
    }



    //Salto, Si personaje.moverEstado.saltando está a 1 comenzamos el salto y cambiamos el valor,
    //  si está a 0.5 es que ha terminado el salto y hay que volver a correr o esperar.
    if(personaje.moverEstado.saltando == 0.5)
    {
        //Vamos a correr
        if(personaje.moverEstado.delante == 1 && robot.poderAndar.front == true)
        {
            personaje.pesoAnimacion.correr += velocidadCambioAnimación;
            personaje.pesoAnimacion.salto  -= velocidadCambioAnimación;
            personaje.play("correrBueno", personaje.pesoAnimacion.correr);
            personaje.play("saltoBueno", personaje.pesoAnimacion.salto);
            if(personaje.pesoAnimacion.salto <= 0)
            {
                personaje.pesoAnimacion.salto = 0;
                personaje.moverEstado.saltando = 0;
                personaje.stopOne("saltoBueno");
                personaje.reset("saltoBueno");
            }

        }
        else //Vamos a esperar
        {
            personaje.pesoAnimacion.esperar += velocidadCambioAnimación;
            personaje.pesoAnimacion.salto  -= velocidadCambioAnimación;
            personaje.play("esperarBueno",personaje.pesoAnimacion.esperar);
            personaje.play("saltoBueno", personaje.pesoAnimacion.salto);
            if(personaje.pesoAnimacion.salto <= 0)
            {
                personaje.pesoAnimacion.salto = 0;
                personaje.moverEstado.saltando = 0;
                personaje.stopOne("saltoBueno");
                personaje.reset("saltoBueno");
            }

        }
    }//Saltamos y empezamos su animacion bloqueando lo demas
    else if(personaje.moverEstado.saltando == 1 && robot.poderAndar.front == true)
    {
        robot.acelerar();
        //Si acaba de empezar se hace el cambio de animación.
        if(personaje.pesoAnimacion.salto <= 1)
        {
            personaje.pesoAnimacion.salto += velocidadCambioAnimación;
            personaje.pesoAnimacion.correr -= velocidadCambioAnimación;
            personaje.pesoAnimacion.esperar -= velocidadCambioAnimación;


            personaje.play("saltoBueno", personaje.pesoAnimacion.salto);
            personaje.play("correrBueno", personaje.pesoAnimacion.correr);
            personaje.play("esperarBueno", personaje.pesoAnimacion.esperar);
        }

        //movemos el personaje en el eje Y dependiendo del momento de la animacion

        if(personaje.mixer.clipAction("saltoBueno").time > 1.15 && personaje.mixer.clipAction("saltoBueno").time < 2.85)
        {
            personaje.position.y += velocidadSalto;
        }
        else if(personaje.mixer.clipAction("saltoBueno").time > 2.85 && personaje.position.y > -30)
        {
            personaje.position.y -= velocidadSalto;
        }


    }
    //Si no esta saltando se anima correr, esperar, girarIz o girarDer,
    //Si se está pulsando hacia adelante empieza a ganar peso la animación de correr hasta el tope
    else if(personaje.moverEstado.saltando == 0 && personaje.moverEstado.delante == 1 && personaje.pesoAnimacion.correr <= 1 && robot.poderAndar.front == true)
    {
        robot.acelerar();
        personaje.pesoAnimacion.correr += velocidadCambioAnimación;
        //Si vuelve de saltar, esperar ya estará a 0 y no hace falta cambiarla. En caso contrario esperar disminuye conforme correr avanza
        if(personaje.pesoAnimacion.esperar >= 0)
            personaje.pesoAnimacion.esperar = 1.0 - personaje.pesoAnimacion.correr;

        personaje.play("correrBueno", personaje.pesoAnimacion.correr);
        personaje.play("esperarBueno", personaje.pesoAnimacion.esperar);
    }
    //Si pulsamos girarIz gira a la izquierda siempre y cuando no esté corriendo
    else if(personaje.moverEstado.girarIz == 1 && personaje.moverEstado.saltando == 0 && personaje.moverEstado.delante == 0 && robot.poderAndar.left == true)
    {
        robot.girarIz();
        personaje.pesoAnimacion.correr += velocidadCambioAnimación;
        //Si vuelve de saltar, esperar ya estará a 0 y no hace falta cambiarla. En caso contrario esperar disminuye conforme correr avanza
        if(personaje.pesoAnimacion.esperar >= 0)
            personaje.pesoAnimacion.esperar = 1.0 - personaje.pesoAnimacion.correr;

        personaje.play("correrBueno", personaje.pesoAnimacion.correr);
        personaje.play("esperarBueno", personaje.pesoAnimacion.esperar);

        //ponemos mirando al personaje hacia la izquierda
        personaje.rotation.y = 1.5;
    }
    //Si pulsamos girarDe gira a la derecha siempre y cuando no esté corriendo
    else if(personaje.moverEstado.girarDe == 1 && personaje.moverEstado.saltando == 0 && personaje.moverEstado.delante == 0 && robot.poderAndar.right == true)
    {
        robot.girarDe();
        personaje.pesoAnimacion.correr += velocidadCambioAnimación;
        //Si vuelve de saltar, esperar ya estará a 0 y no hace falta cambiarla. En caso contrario esperar disminuye conforme correr avanza
        if(personaje.pesoAnimacion.esperar >= 0)
            personaje.pesoAnimacion.esperar = 1.0 - personaje.pesoAnimacion.correr;

        personaje.play("correrBueno", personaje.pesoAnimacion.correr);
        personaje.play("esperarBueno", personaje.pesoAnimacion.esperar);

        //ponemos mirando al personaje hacia la izquierda
        personaje.rotation.y = -1.4;
    }

    //Si está corriendo y se libera el botón de hacia alante o girar empieza a ganar peso la animación de esperar
    else if(personaje.moverEstado.saltando == 0 && personaje.moverEstado.delante == 0 && personaje.pesoAnimacion.esperar < 1)
    {
        robot.parar();
        personaje.pesoAnimacion.esperar += velocidadCambioAnimación;
        //Si vuelve de saltar, correr ya estará a 0 y no hace falta cambiarla. En caso contrario correr disminuye conforme esperar avanza
        if(personaje.pesoAnimacion.correr >= 0)
            personaje.pesoAnimacion.correr = 1 - personaje.pesoAnimacion.esperar;

        personaje.play("correrBueno", personaje.pesoAnimacion.correr);
        personaje.play("esperarBueno", personaje.pesoAnimacion.esperar);
    }


    restaurarPesos();
    //console.log(personaje.mixer.clipAction("saltoBueno").time);

}

function restaurarPesos()
{
    if(personaje.pesoAnimacion.salto < 0)
        personaje.pesoAnimacion.salto = 0;
    else if(personaje.pesoAnimacion.salto > 1)
        personaje.pesoAnimacion.salto = 1;

    if(personaje.pesoAnimacion.correr < 0)
        personaje.pesoAnimacion.correr = 0;
    else if(personaje.pesoAnimacion.correr > 1)
        personaje.pesoAnimacion.correr = 1;

    if(personaje.pesoAnimacion.esperar < 0)
        personaje.pesoAnimacion.esperar = 0;
    else if(personaje.pesoAnimacion.esperar > 1)
        personaje.pesoAnimacion.esperar = 1;
}


function manejadorTouch(cod)
{
    var aux = "";
    switch(cod)
    {
        case "sW":
            aux = {keyCode: 87};
            onKeydown(aux);
            break;
        case "eW":
            aux = {keyCode: 87};
            onKeyup(aux);
            break;

        case "sA":
            aux = {keyCode: 65};
            onKeydown(aux);
            break;
        case "eA":
            aux = {keyCode: 65};
            onKeyup(aux);
            break;

        case "sD":
            aux = {keyCode: 68};
            onKeydown(aux);
            break;
        case "eD":
            aux = {keyCode: 68};
            onKeyup(aux);
            break;

        case "sQ":
            aux = {keyCode: 81};
            onKeydown(aux);
            break;
        case "eQ":
            aux = {keyCode: 81};
            onKeyup(aux);
            break;

        case "sE":
            aux = {keyCode: 69};
            onKeydown(aux);
            break;
        case "eE":
            aux = {keyCode: 69};
            onKeyup(aux);
            break;

        case "sBarra":
            aux = {keyCode: 32};
            onKeydown(aux);
            break;
        case "eBarra":
            aux = {keyCode: 32};
            onKeyup(aux);
            break;
    }
}

function actualizarVideo()
{
    if(lastCallVideo == 4)
    {
        lastCallVideo = 0;
        // Actualizamos la textura.
        imgSrc = "php/get_pic.php?time=" + new Date().getTime();

        //creamos la imagen que le vamos a pasar al canvas 2D para la RA
        var img1 = new Image(); // HTML5 Constructor
        img1.src = imgSrc;

        videoTexture = new THREE.TextureLoader().load(
            //Resource to be loaded
            imgSrc,
            //Function onLoad
            function (nuevaTextura)
            {
                nuevaTextura.minFilter = THREE.LinearFilter;
                plane.material.map = nuevaTextura

                //Pintamos el canvas 2D con la imagen para la RA
                canvas2d.getContext('2d').drawImage(img1, 0, 0, contenedor.canvasWidth, contenedor.canvasHeight);
                canvas2d.changed = true;
            }
        );


    }
    lastCallVideo++;
}