#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "DMS";
const char* password = "dMS@2026";

const int motorPin = 5;   // GPIO 5 on ESP32
bool motorState = false;

WebServer server(80);

void setup() {
  Serial.begin(115200);
  pinMode(motorPin, OUTPUT);
  digitalWrite(motorPin, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  server.on("/motor/on", HTTP_GET, []() {
    motorState = true;
    digitalWrite(motorPin, HIGH);
    Serial.println("Motor ON command received");
    Serial.print("GPIO5 Voltage: ");
    Serial.print(digitalRead(motorPin) ? "HIGH (3.3V)" : "LOW (0V)");
    Serial.println();
    server.send(200, "application/json", "{\"status\":\"on\"}");
  });

  server.on("/motor/off", HTTP_GET, []() {
    motorState = false;
    digitalWrite(motorPin, LOW);
    Serial.println("Motor OFF command received");
    Serial.print("GPIO5 Voltage: ");
    Serial.print(digitalRead(motorPin) ? "HIGH (3.3V)" : "LOW (0V)");
    Serial.println();
    server.send(200, "application/json", "{\"status\":\"off\"}");
  });

  server.on("/motor/toggle", HTTP_GET, []() {
    motorState = !motorState;
    digitalWrite(motorPin, motorState ? HIGH : LOW);
    server.send(200, "application/json",
      "{\"status\":\"" + String(motorState ? "on" : "off") + "\"}");
  });

  server.on("/status", HTTP_GET, []() {
    server.send(200, "application/json",
      "{\"motor\":\"" + String(motorState ? "on" : "off") + "\"}");
  });

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}
