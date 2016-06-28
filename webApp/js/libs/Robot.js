/**
 * Created by Miguel on 28/06/2016.
 */

function Robot()
{
    this.estado = {avanzar:0, girarIz: 0, girarDe: 0};
    this.urlControl = "../php/controlRobot.php";
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
              console.log("Avanzando");
          }
      });
  }
};

Robot.prototype.parar = function()
{
    if(this.estado.avanzar == 1)
    {
        this.estado.avanzar = 0;

        $.ajax({
            type: "POST",
            url: this.urlControl,
            data: {orden: "parar"},
            success: function (response)
            {
                console.log("parando");
            }
        });
    }
};