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
    		$comando = exec('python controlRobot.py '.$argumentos);
    	}
    }
?>