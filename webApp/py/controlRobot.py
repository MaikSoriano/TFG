import serial
import sys

arduino = serial.Serial('/dev/ttyACM0', 9600)

#arduino.open()

comando = sys.argv[1]
Print comando

arduino.write(comando) #Mandar un comando hacia arduino

arduino.close() #Finalizamos la comunicacion
