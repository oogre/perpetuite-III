#define TOUCH_PIN 8
#define VAN_PIN 9
long t0 = 0;
void setup() {
  pinMode(TOUCH_PIN, INPUT_PULLUP);
  pinMode(VAN_PIN, OUTPUT);
  Serial.begin(9600);
  digitalWrite(VAN_PIN, LOW);
}

void loop() {
/*
  if (millis() - t0 > 1000) {
    t0 = millis();
    digitalWrite(VAN_PIN, !digitalRead(VAN_PIN));
  }
*/
  if (Serial.available() > 0) {
    byte value = Serial.read();
    if (value  == 0x00) {
      digitalWrite(VAN_PIN, LOW);
    } else if (value  == 0x01) {
      digitalWrite(VAN_PIN, HIGH);
    }
  }

  Serial.println(digitalRead(TOUCH_PIN));
  delay(10);

}
