/**
 * Created by Miguel on 25/08/2016.
 */
function JuegoBarriles()
{
    this.markerRootBarriles = null;
    this.puerta = null;
    this.barriles = [];
    this.jugando = false;
    this.tiempoAntesDeStop = 60;
    this.tiempoEntreBarriles = 120;
    this.tiempoJugado = 0;
    this.ultimoLanzamiento = 0;

    this.iniciar = function()
    {
        var juegoBarriles = this;
        //markerRoot contendrá los modelos 3D y será el que seguirá a marcador detectado
        this.markerRootBarriles = new THREE.Object3D();
        this.markerRootBarriles.matrixAutoUpdate = false;
        // Añadimos el markerRoot  la escena
        arEscena.add(this.markerRootBarriles);

        // añadimos los objetos que queramos al markerRoot
        //this.puerta = new THREE.Mesh(
        //    new THREE.CubeGeometry(100, 100, 100),
        //    new THREE.MeshBasicMaterial({color: 0xaa7888, vertexColors: THREE.FaceColors })
        //);
        //this.markerRootBarriles.add(this.puerta);

        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;
        loader.load( 'models/puerta.dae', function ( collada ) {

            juegoBarriles.puerta = collada.scene;

            juegoBarriles.puerta.traverse( function ( child ) {

                if ( child instanceof THREE.SkinnedMesh ) {

                    var animation = new THREE.Animation( child, child.geometry.animation );
                    animation.play();
                }

            } );

            //dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
            juegoBarriles.puerta.updateMatrix();
            juegoBarriles.puerta.abrir = false;
            juegoBarriles.markerRootBarriles.add( juegoBarriles.puerta );
            juegoBarriles.markerRootBarriles.visible = false;
        });

        loader.load( 'models/trampilla.dae', function ( collada ) {

            juegoBarriles.marco = collada.scene;

            juegoBarriles.marco.traverse( function ( child ) {

                if ( child instanceof THREE.SkinnedMesh ) {

                    var animation = new THREE.Animation( child, child.geometry.animation );
                    animation.play();
                }

            } );

            //dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
            juegoBarriles.marco.updateMatrix();

            juegoBarriles.markerRootBarriles.add( juegoBarriles.marco );
            juegoBarriles.markerRootBarriles.visible = false;
        });




        for(var i = 0; i < 10; i++)
        {
            var barril = new Barril(i, this.markerRootBarriles);
            this.barriles.push(barril);
        }

        //this.mostrar(false);
    };

    this.mostrar = function(visible)
    {
        if(visible == undefined)
            this.markerRootBarriles.visible = !this.markerRootBarriles.visible;
        else
            this.markerRootBarriles.visible = visible;

        for(var i = 0; i < this.barriles.length; i++)
        {
            if(visible == undefined)
                this.barriles[i].barrilMalla.visible = !this.barriles[i].barrilMalla.visible;
            else
                this.barriles[i].barrilMalla.visible = visible;
        }
    };

    this.play = function(matriz, contador)
    {
        this.tiempoJugado++;
        //Si hace X segundos que no ve el marcador y estaba jugando se para el juego
        if(contador >= this.tiempoAntesDeStop && this.jugando)
            this.stop();
        else if(contador < this.tiempoAntesDeStop)
        {
            //Si aun no esta jugando se inicia el juego
            if (!this.jugando)
            {
                this.jugando = true;
                this.mostrar(true);
            }

            //Se asigna al markerRoot la posición del marcador
            this.markerRootBarriles.matrix.setFromArray(matriz);

            this.abrirPuerta();
            this.soltarBarril();
            this.moverBarriles();
        }
    };

    this.stop = function()
    {
        this.jugando = false;
        this.mostrar(false);

        this.reiniciar();
    };

    this.reiniciar = function()
    {
        this.tiempoJugado = 0;
        this.ultimoLanzamiento = 0;

        for(var i = 0; i < this.barriles.length; i++)
        {
            var aux = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];

            this.barriles[i].padreAuxiliar.remove(this.barriles[i].barrilMalla);
            this.markerRootBarriles.add(this.barriles[i].barrilMalla);
            this.barriles[i].soltado = false;
            this.barriles[i].zInicial = -1;
            this.barriles[i].xInicial = -1;
            this.barriles[i].xIncremento = -1;
            this.barriles[i].yIncremento = -1;
            this.barriles[i].xFinal = personaje.position.x / 1.5;
            this.barriles[i].xVelocidad = -1;
            this.barriles[i].yVelocidad = -1;


            this.barriles[i].padreAuxiliar.matrix.setFromArray(aux);

            this.barriles[i].barrilMalla.position.x = 0;
            this.barriles[i].barrilMalla.position.y = 0;
            this.barriles[i].barrilMalla.position.z = 0;

            this.barriles[i].barrilMalla.rotation.x = 0;
            this.barriles[i].barrilMalla.rotation.y = 0;
        }
    };

    this.traspasarPadreBarril = function(barril)
    {
        //juegoBarriles.barriles[0].barrilMalla.position.z -= 100;
        //juegoBarriles.barriles[0].barrilMalla.position.z -= 100;

        var aux = barril.barrilMalla.matrixWorld.elements;

        juegoBarriles.markerRootBarriles.remove(barril.barrilMalla);
        barril.padreAuxiliar.add(barril.barrilMalla);
        barril.padreAuxiliar.matrix.setFromArray(aux);
        //barril.padreAuxiliar.matrix.elements[4] = 0;
        //barril.padreAuxiliar.matrix.elements[5] = 0;
        //barril.padreAuxiliar.matrix.elements[6] = 0;
    };

    this.abrirPuerta = function()
    {
        if(this.puerta.abrir)
        {
            this.puerta.rotateX(0.05);
            if(this.puerta.position.y < 40)
                this.puerta.position.y += 2;
            if(this.puerta.rotation.x > -0.57)
                this.puerta.abrir = false;
        }
        else if(!this.puerta.abrir)
        {
            if(this.puerta.position.y > 0)
                this.puerta.position.y -= 2;
            if(this.puerta.rotation.x > -1.57)
                this.puerta.rotateX(-0.05);
        }
    };

    this.soltarBarril = function()
    {
        for(var id = 0; id <this.barriles.length; id++)
        {
            //Abrimos la puerta un poquito antes de soltar el barril
            if(this.tiempoJugado - (this.ultimoLanzamiento-20) >= this.tiempoEntreBarriles && this.barriles[id].soltado == false && !this.puerta.abrir)
            {
                this.puerta.abrir = true;
            }
            //Soltamos el barril
            if(this.tiempoJugado - this.ultimoLanzamiento >= this.tiempoEntreBarriles && this.barriles[id].soltado == false)
            {
                this.ultimoLanzamiento = this.tiempoJugado;
                this.barriles[id].soltado = true;
                this.traspasarPadreBarril(this.barriles[id]);
            }
        }
    };

    this.moverBarriles = function()
    {
        for(var id = 0; id <this.barriles.length; id++)
        {
            if(this.barriles[id].soltado == true)
            {
                if(this.barriles[id].zInicial == -1)
                {
                    this.barriles[id].zInicial = this.barriles[id].padreAuxiliar.matrix.elements[14];
                    this.barriles[id].xInicial = this.barriles[id].padreAuxiliar.matrix.elements[12];
                }
                if(personaje.moverEstado.delante == 1 || personaje.moverEstado.saltando == 1)
                {
                    this.barriles[id].zVelocidad = 8;
                }
                else
                    this.barriles[id].zVelocidad = 4;

                //Mover este bloque arriba si queremos que los barriles no nos sigan.
                this.barriles[id].xIncremento = ((personaje.position.x + 40) / 1.5) - this.barriles[id].xInicial;
                var saltosEnZ = (this.barriles[id].zInicial-300)/this.barriles[id].zVelocidad;
                this.barriles[id].xVelocidad = this.barriles[id].xIncremento / saltosEnZ;
                this.barriles[id].xFinal = personaje.position.x / 1.5;

                this.barriles[id].yIncremento = (-60) - this.barriles[id].padreAuxiliar.matrix.elements[13];
                this.barriles[id].yVelocidad = this.barriles[id].yIncremento / saltosEnZ;


                //Llevar barril hasta el personaje
                if(this.barriles[id].padreAuxiliar.matrix.elements[12] != this.barriles[id].xFinal )
                    this.barriles[id].padreAuxiliar.matrix.elements[12] += this.barriles[id].xVelocidad;

                if(this.barriles[id].padreAuxiliar.matrix.elements[14] > 0)
                {
                    this.barriles[id].padreAuxiliar.matrix.elements[14] -= this.barriles[id].zVelocidad;

                    //if (this.barriles[id].padreAuxiliar.matrix.elements[13] < -(this.barriles[id].padreAuxiliar.matrix.elements[14] / 5.45))
                    this.barriles[id].padreAuxiliar.matrix.elements[13] += this.barriles[id].yVelocidad;
                }

                //Girar y botar barril
                this.barriles[id].barrilMalla.rotation.x += 0.08;
                this.barriles[id].barrilMalla.rotation.y = 0.2;

            }
        }
    };

    //Cuando termina de cargar el script ejecuta iniciar.
    this.iniciar();
}

function Barril(id, markerRoot)
{
    var barril = this;
    this.id = id;
    this.soltado = false;
    this.zInicial = -1;
    this.xInicial = -1;
    this.xIncremento = -1;
    this.xFinal = 0;
    this.xVelocidad = -1;
    this.yVelocidad = -1;
    this.yIncremento = -1;
    this.zVelocidad = 4;

    //El padre auxiliar se usa al sacar el barril del markerRoot cuando es "lanzado" en el juego.
    this.padreAuxiliar = new THREE.Object3D();
    this.padreAuxiliar.matrixAutoUpdate = false;
    // Añadimos el markerRoot  la escena
    arEscena.add(this.padreAuxiliar);

    //this.barrilMalla = null;
    //// Creamos el barril y lo añadimos al markerRoot
    //this.barrilMalla = new THREE.Mesh(
    //    new THREE.CubeGeometry(50, 25, 25),
    //    new THREE.MeshStandardMaterial( { color: 0xa03c12, vertexColors: THREE.FaceColors } )
    //);
    //this.barrilMalla.position.z = 0;
    //this.barrilMalla.castShadow = true;
    //markerRoot.add(this.barrilMalla);


    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load( 'models/barril.dae', function ( collada ) {

        barril.barrilMalla = collada.scene;

        barril.barrilMalla.traverse( function ( child ) {

            if ( child instanceof THREE.SkinnedMesh ) {

                var animation = new THREE.Animation( child, child.geometry.animation );
                animation.play();
            }

        } );

        //dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
        barril.barrilMalla.updateMatrix();
        barril.barrilMalla.castShadow = true;
        barril.barrilMalla.visible = false;

        markerRoot.add(barril.barrilMalla );
    });

}