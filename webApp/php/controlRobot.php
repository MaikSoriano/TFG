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

    		default:
    			$argumentos = null;
    			break;
    	}

    	if($argumentos != null)
    	{
    		$comando = exec('python ../py/controlRobot.py '.$argumentos);
    	}
    }
?>