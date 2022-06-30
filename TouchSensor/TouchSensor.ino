#define TOUCH_PIN 8
void setup() {
  pinMode(TOUCH_PIN, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  Serial.println(digitalRead(TOUCH_PIN));
  delay(100);

}
