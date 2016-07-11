import serial
import sys
import time

arduino = serial.Serial('/dev/ttyACM0', 9600, timeout = 0.5)

#arduino.open()

comando = sys.argv[1]

arduino.write(comando) #Mandar un comando hacia arduino
print comando

if comando == 'M':
        distancia = None
        while distancia is None:
                distancia = arduino.readline() #Recibe la distancia
                print distancia


arduino.close() #Finalizamos la comunicacion
