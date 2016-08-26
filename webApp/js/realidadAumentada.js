/**
 * Created by Miguel on 23/08/2016.
 */

var arParam;
var arRaster;
var arDetector;
var markers = {};
var markerRoot = null;
const  JUEGOBARRILES = 8;

function inicializarDetectorMarcadores(canvas, video)
{
    //inicializar raster RGB para el canvas 2D. JSARToolKit usa el raster para leer los datos de la imagen
    arRaster = new NyARRgbRaster_Canvas2D(canvas);

    // FLARParam es el objeto usado para establecer los parametros de la cámara.
    // Aqui lo creamos para imagenes de 320x240
    arParam = new FLARParam(canvas.width, canvas.height);

    //FLARMultiIdMarkerDetector es el algoritmo de detección de marcadores
    //Detecta múltiples ID de marcadores
    arDetector = new FLARMultiIdMarkerDetector(arParam, 110);

    //Para detectar video marcar el modo continuo a true
    arDetector.setContinueMode(video);


    // Hacemos que la cámara de Three.js use los parámetros de FLARParam
    var tmp = new Float32Array(16);
    arParam.copyCameraMatrix(tmp, 1, 10000);
    arCamara.projectionMatrix.setFromArray(tmp);

}

function detectarMarcadores()
{
    //Hacemos la detección de marcadores. El parámetro threshold determina el valor para convertir la imagen en 1-bit blanco y negro.
    var markerCount = arDetector.detectMarkerLite(arRaster, 50);

    //repetimos este proceso en los marcadores detectados
    //creamos un NyARTransMatResult para obtener las matrices de translacion de los marcadores
    var resultMat = new NyARTransMatResult();

    //recorremos los marcadores detectados y sacamos su ID y las matrices de transformación
    for (var idx = 0; idx < markerCount; idx++)
    {
        var id = arDetector.getIdMarkerData(idx);

        //Leer bytes del paquete ID
        var currId = -1;
        if (id.packetLength <= 4)
        {
            currId = 0;
            for (var i = 0; i < id.packetLength; i++)
            {
                //Averiguamos la ID del marcador
                currId = (currId << 8 | id.getPacketData(i));
            }
        }

        //Si encontramos una nueva ID la empezamos a seguir
        if (markers[currId] == null)
        {
            markers[currId] = {};
        }

        //Cogemos la matriz de transformacion del marcador detectado
        arDetector.getTransformMatrix(idx, resultMat);

        //Copiamos la matriz en nuestro seguidor de marcadores
        markers[currId].transform = Object.asCopy(resultMat);

        // Copiar la matriz del marcador en la matriz tmp con formato de three.js
        var tmp = new Float32Array(16);
        copyMarkerMatrix(resultMat, tmp);

        //Renovamos el contador del marcador a 0
        markers[currId].contador = 0;

        //Asigarle a nuestro objeto markerRoot la matriz del marcador
        //markerRoot.matrix.setFromArray(tmp);
    }
}

function ejecutarMarcador()
{
    for (var id in markers)
    {
        markers[id].contador++;
        if(id == JUEGOBARRILES)
        {
            var tmp = new Float32Array(16);
            copyMarkerMatrix(markers[id].transform, tmp);
            juegoBarriles.play(tmp, markers[id].contador);
        }
    }
}

function renovarContadorMarcador(id)
{

}

//Hay que encontrar la matriz del marcador y transformarla al mismo formato que las matrices de Three.js
function copyMarkerMatrix(arMat, glMat)
{
    glMat[0] = arMat.m00;
    glMat[1] = -arMat.m10;
    glMat[2] = arMat.m20;
    glMat[3] = 0;

    glMat[4] = arMat.m01;
    glMat[5] = -arMat.m11;
    glMat[6] = arMat.m21;
    glMat[7] = 0;

    glMat[8] = -arMat.m02;
    glMat[9] = arMat.m12;
    glMat[10] = -arMat.m22;
    glMat[11] = 0;

    glMat[12] = arMat.m03;
    glMat[13] = -arMat.m13;
    glMat[14] = arMat.m23;
    glMat[15] = 1;
}

//Convierte matrices de glMatrix en matrices de Three.js
THREE.Matrix4.prototype.setFromArray = function (m)
{
    return this.set(
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    );
};