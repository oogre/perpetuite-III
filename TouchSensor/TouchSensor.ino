#define TOUCH_PIN 8
#define VAN_PIN 9
uint32_t t0 = 0;
void setup() {
  pinMode(TOUCH_PIN, INPUT_PULLUP);
  pinMode(VAN_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.println(digitalRead(TOUCH_PIN));
  delay(10);

  if(millis() - t0 > 1000){
    t0 = millis();
    digitalWrite(VAN_PIN, !digitalRead(VAN_PIN));
  }
}
