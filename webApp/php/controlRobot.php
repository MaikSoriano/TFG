<?php
    if(isset($_GET["orden"]))
    {
    	$argumentos = null;
    	switch($_GET["orden"])
    	{
    		case "avanzar":
    			$argumentos = "W";
    			break;

    		case "parar":
    			$argumentos = "X";
    			break;

    		case "girarIz":
    			$argumentos = "A";
    			break;

    		case "girarDe":
    			$argumentos = "D";
    			break;

    		default:
    			$argumentos = null;
    			break;
    	}

    	if($argumentos != null)
    	{
    		exec("python ../py/controlRobot.py ".$argumentos);
    	}
    }
?>