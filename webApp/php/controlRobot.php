<?php

    if(isset($_POST["orden"]))
    {
    	$argumentos = null;
    	switch($_POST["orden"])
    	{
    		case "avanzar":
    			$argumentos = "W";
    			break;

    		case "parar":
    			$argumentos = "X";
    			break;

    		case "girarIz":
    			$argumentos = "Q";
    			break;

    		case "girarDe":
    			$argumentos = "E";
    			break;

            case "retroceder":
                $argumentos = "S";
                break;

            case "distancia":
                $argumentos = "M";
                break;

    		default:
    			$argumentos = null;
    			break;
    	}

    	if($argumentos != null)
    	{
    		$comando = "vacio";
    		$comando = shell_exec('python ../py/controlRobot.py '.$argumentos);
    		echo $comando;
    	}
    }
?>