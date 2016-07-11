/*****************************************************************
 * Autor: Miguel Soriano
 * Proyecto: TFG - https://github.com/MaikSoriano/TFG
 * Fecha: Julio 2016
 *****************************************************************/
#define MOTOR1_IN1 2  //I1 Right
#define MOTOR1_IN2 3  //I2 Right
#define MOTOR1_PWM 9  //ENA

#define MOTOR2_IN1 4  //I3 Left Retrocede
#define MOTOR2_IN2 5  //I4 Left Avanza
#define MOTOR2_PWM 10 //ENB

#define ULTRASONIC_TRIG 8 //Trig to HC-SR04 
#define ULTRASONIC_ECHO 7 //Echo from HC-SR04 

#define LED 13

long distancia;
long tiempo;

void setup()
{
  // Setup pins motor1
  pinMode(MOTOR1_IN1, OUTPUT); 
  pinMode(MOTOR1_IN2, OUTPUT);
  pinMode(MOTOR1_PWM, OUTPUT);
  
  // Setup pins motor2
  pinMode(MOTOR2_IN1, OUTPUT);
  pinMode(MOTOR2_IN2, OUTPUT);
  pinMode(MOTOR2_PWM, OUTPUT);
  
  // Setup ultrasonic sensor
  pinMode(ULTRASONIC_TRIG, OUTPUT);
  pinMode(ULTRASONIC_ECHO, INPUT);
  
  pinMode(LED, OUTPUT);
  
  // Start motors
  digitalWrite(MOTOR1_PWM, HIGH);
  digitalWrite(MOTOR2_PWM, HIGH);
  
    
  Serial.begin(9600);
}

void loop()
{
   //Check messages to control the robot
  if(Serial.available())
  {
    char c = Serial.read();
    if(c == 'W')
    {
      avanzar();
    } 
    else if(c == 'X')
    {
      parar();
    }
    else if(c == 'S')
    {
      retroceder();
    }
    else if(c == 'E')
    {
      girarDer();
    }
    else if(c == 'Q')
    {
      girarIzq();
    }
    else if(c == 'M')
    {
      leerDistancia();
    }
  }
}

void avanzar()
{
  digitalWrite(LED, HIGH);
  
  digitalWrite(MOTOR1_IN2, HIGH);
  digitalWrite(MOTOR2_IN2, HIGH);
}

void parar()
{
  digitalWrite(LED, LOW);
  
  //motor1
  digitalWrite(MOTOR1_IN1, LOW);
  digitalWrite(MOTOR1_IN2, LOW);
  //motor2
  digitalWrite(MOTOR2_IN1, LOW);
  digitalWrite(MOTOR2_IN2, LOW);
}

void girarDer() //Probar girando las 2 ruedas en sentido contrario
{
  digitalWrite(LED, HIGH);
  
  digitalWrite(MOTOR1_IN2, LOW);
  digitalWrite(MOTOR2_IN2, HIGH);
}

void girarIzq()
{
  digitalWrite(LED, HIGH);
  
  digitalWrite(MOTOR1_IN2, HIGH);
  digitalWrite(MOTOR2_IN2, LOW);
}

void retroceder()
{
  digitalWrite(LED, HIGH);
  
  digitalWrite(MOTOR1_IN1, HIGH);
  digitalWrite(MOTOR2_IN1, HIGH);
}

void leerDistancia()
{
  //Check front distance
  distancia = 0;
  digitalWrite(ULTRASONIC_TRIG, LOW);
  delayMicroseconds(5);
  digitalWrite(ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  tiempo = pulseIn(ULTRASONIC_ECHO, HIGH);
  distancia = int(tiempo/58.2);
  delayMicroseconds(10);
  Serial.println(distancia);
  //delay(1000);
}

