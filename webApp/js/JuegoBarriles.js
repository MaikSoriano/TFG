/**
 * Created by Miguel on 25/08/2016.
 */
function JuegoBarriles()
{
    this.markerRootBarriles = null;
    this.puerta = null;
    this.barriles = [];
    this.jugando = false;
    this.tiempoAntesDeStop = 240;
    this.tiempoEntreBarriles = 120;
    this.tiempoJugado = 0;
    this.ultimoLanzamiento = 0;

    this.iniciar = function()
    {
        //markerRoot contendrá los modelos 3D y será el que seguirá a marcador detectado
        this.markerRootBarriles = new THREE.Object3D();
        this.markerRootBarriles.matrixAutoUpdate = false;
        // Añadimos el markerRoot  la escena
        arEscena.add(this.markerRootBarriles);

        // añadimos los objetos que queramos al markerRoot
        this.puerta = new THREE.Mesh(
            new THREE.CubeGeometry(100, 100, 100),
            new THREE.MeshBasicMaterial({color: 0xaa7888, vertexColors: THREE.FaceColors })
        );
        this.puerta.position.z = 0;
        this.markerRootBarriles.add(this.puerta);

        var barril1 = new Barril("1", this.markerRootBarriles);
        var barril2 = new Barril("2", this.markerRootBarriles);
        var barril3 = new Barril("3", this.markerRootBarriles);
        var barril4 = new Barril("4", this.markerRootBarriles);

        this.barriles.push(barril1);
        this.barriles.push(barril2);
        this.barriles.push(barril3);
        this.barriles.push(barril4);

        this.mostrar(false);
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
            this.stop()
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


            var aux = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

            this.barriles[i].padreAuxiliar.remove(this.barriles[i].barrilMalla)
            this.markerRootBarriles.add(this.barriles[i].barrilMalla)
            this.barriles[i].soltado = false;


            this.barriles[i].padreAuxiliar.matrix.setFromArray(aux);

            this.barriles[i].barrilMalla.position.x = 0;
            this.barriles[i].barrilMalla.position.y = 0;
            this.barriles[i].barrilMalla.position.z = 0;
        }
    };

    this.traspasarPadreBarril = function(barril)
    {
        //juegoBarriles.barriles[0].barrilMalla.position.z -= 100;
        //juegoBarriles.barriles[0].barrilMalla.position.z -= 100;

        var aux = barril.barrilMalla.matrixWorld.elements;

        juegoBarriles.markerRootBarriles.remove(barril.barrilMalla)
        barril.padreAuxiliar.add(barril.barrilMalla)
        barril.padreAuxiliar.matrix.setFromArray(aux);
    };

    this.soltarBarril = function()
    {
        for(var id = 0; id <this.barriles.length; id++)
        {
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
                //Llevar barril hasta el personaje
                if(this.barriles[id].padreAuxiliar.matrix.elements[12] > 0)
                    this.barriles[id].padreAuxiliar.matrix.elements[12] -= 3 ;
                if(this.barriles[id].padreAuxiliar.matrix.elements[12] < 0)
                    this.barriles[id].padreAuxiliar.matrix.elements[12] += 3 ;

                if(this.barriles[id].padreAuxiliar.matrix.elements[14] > 150)
                    this.barriles[id].padreAuxiliar.matrix.elements[14] -= 4;

                this.barriles[id].padreAuxiliar.matrix.elements[13] = -(this.barriles[id].padreAuxiliar.matrix.elements[14]/4);

                //Girar y botar barril
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
    //El padre auxiliar se usa al sacar el barril del markerRoot cuando es "lanzado" en el juego.
    this.padreAuxiliar = new THREE.Object3D();
    this.padreAuxiliar.matrixAutoUpdate = false;
    // Añadimos el markerRoot  la escena
    arEscena.add(this.padreAuxiliar);

    this.barrilMalla = null;
    //// Creamos el barril y lo añadimos al markerRoot
    this.barrilMalla = new THREE.Mesh(
        new THREE.CubeGeometry(50, 25, 25),
        new THREE.MeshStandardMaterial( { color: 0xa03c12, vertexColors: THREE.FaceColors } )
    );
    this.barrilMalla.position.z = 0;
    markerRoot.add(this.barrilMalla);
}