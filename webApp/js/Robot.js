/**
 * Created by Miguel on 28/06/2016.
 */

function Robot()
{
    this.estado = {avanzar:0, girarIz: 0, girarDe: 0};
    this.urlControl = "php/controlRobot.php";
    this.distancia = {front: 0, left: 0, right: 0};
    this.poderAndar = {front: true, left: true, right: true};
    this.lastCallDistancia = 0;
}

Robot.prototype.acelerar = function()
{
  if(this.estado.avanzar != 1)
  {
      this.estado.avanzar = 1;

      $.ajax({
          type: "POST",
          url: this.urlControl,
          data: {orden: "avanzar"},
          success: function (response)
          {
              //console.log("Avanzando");
          }
      });
  }
};

Robot.prototype.parar = function()
{
    if(this.estado.avanzar == 1 || this.estado.girarDe == 1 || this.estado.girarIz == 1)
    {
        this.estado.avanzar = 0;
        this.estado.girarDe = 0;
        this.estado.girarIz = 0;

        $.ajax({
            type: "POST",
            url: this.urlControl,
            data: {orden: "parar"},
            success: function (response)
            {
                //console.log("parando");
            }
        });
    }
};

/*
Robot.prototype.retroceder = function()
{
    if(this.estado.avanzar == 1)
    {
        this.estado.avanzar = 0;

        $.ajax({
            type: "POST",
            url: this.urlControl,
            data: {orden: "retroceder"},
            success: function (response)
            {
                //console.log("retroceder");
            }
        });
    }
};
*/

Robot.prototype.girarDe = function()
{
    if(this.estado.girarDe != 1)
    {
        this.estado.girarDe = 1;

        $.ajax({
            type: "POST",
            url: this.urlControl,
            data: {orden: "girarDe"},
            success: function (response)
            {
                //console.log("girar Derecha");
            }
        });
    }
};

Robot.prototype.girarIz = function()
{

    if(this.estado.girarIz != 1)
    {
        this.estado.girarIz = 1;

        $.ajax({
            type: "POST",
            url: this.urlControl,
            data: {orden: "girarIz"},
            success: function (response)
            {
                //console.log("girar Izquierda");
            }
        });
    }
};

Robot.prototype.comprobarDistancia = function(forzar)
{
    if(this.lastCallDistancia == 120 || forzar == true)
    {
        this.lastCallDistancia = 0;

        var robot = this;
        var distanciaMin = 27;

        $.ajax({
            type: "POST",
            url: this.urlControl,
            dataType: "text",
            data: {orden: "distancia"},
            success: function (response)
            {
                var respuesta = response.split("\n");
                //console.log("1:" + respuesta[0] + " 2:" + respuesta[1]);

                respuesta = respuesta[1].split("c");

                if(respuesta[0] == "" || respuesta[0] == "m" || respuesta[0]<=10)
                {
                    robot.comprobarDistancia(true);
                }
                else
                {
                    robot.distancia.front = respuesta[0];
                    if (robot.distancia.front <= distanciaMin)
                        robot.poderAndar.front = false;
                    else if (robot.distancia.front > distanciaMin)
                        robot.poderAndar.front = true;
                }
            }
        });
    }

    this.lastCallDistancia++;
};