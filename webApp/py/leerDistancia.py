import serial
import sys

arduino = serial.Serial('/dev/ttyACM0', 9600, timeout=1)

#arduino.open()

distancia = ""

distancia = arduino.readline() #Recibe la distancia

print distancia


arduino.close() #Finalizamos la comunicacion
