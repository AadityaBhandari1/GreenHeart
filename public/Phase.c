// ESP32 TDS + Turbidity reader + LED blink on successful read
// Connect TDS A0 -> GPIO34, Turbidity A0 -> GPIO35
// Power sensors from 3.3V unless board explicitly supports 5V with 3.3V-safe output.

const int pinTDS = 34;      // ADC1_6 (input-only) - TDS sensor analog out
const int pinTURB = 35;     // ADC1_7 (input-only) - Turbidity analog out
const int ledPin = 2;       // LED pin (GPIO2 is common onboard LED). Change if needed.

const int samples = 20;     // number of samples to average
const float ADC_REF = 3.3;  // reference voltage for ADC (if powered at 3.3V)
const int ADC_MAX = 4095;   // 12-bit resolution

// TDS conversion constant (empirical). Adjust after calibration.
const float temp = 25.0;    // water temp in °C - use a temp sensor for better accuracy
const float Ktemp = 1.0 + 0.02 * (temp - 25.0); // crude compensation factor

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);                      // 12-bit (0-4095)
  analogSetPinAttenuation(pinTDS, ADC_11db);     // allow close to full-scale 0..3.3V
  analogSetPinAttenuation(pinTURB, ADC_11db);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  delay(1000);
  Serial.println("ESP32 TDS + Turbidity reader starting...");
}

int readAvgADC(int pin) {
  long sum = 0;
  for (int i = 0; i < samples; ++i) {
    int v = analogRead(pin);
    sum += v;
    delay(5);
  }
  return (int)(sum / samples);
}

float adcToVoltage(int adcValue) {
  return ( (float)adcValue / (float)ADC_MAX ) * ADC_REF;
}

// Empirical polynomial to estimate EC from voltage (common in hobby projects)
float voltageToEC(float V) {
  // polynomial from many DIY examples (units depend on sensor board)
  return 133.42 * V*V*V - 255.86 * V*V + 857.39 * V;
}

// Empirical conversion from voltage -> NTU for common turbidity sensors
float voltageToNTU(float V) {
  // Polynomial fit (valid approx for ~0–3000 NTU, adjust after calibration)
  float ntu = -1120.4 * V * V + 5742.3 * V - 4352.9;
  if (ntu < 0) ntu = 0; // clamp to zero
  return ntu;
}

// Blink LED once quickly to show a successful read
void blinkSuccess(int pin) {
  digitalWrite(pin, HIGH);
  delay(100);               // LED on for 100 ms
  digitalWrite(pin, LOW);
}

void loop() {
  int rawTDS = readAvgADC(pinTDS);
  int rawTURB = readAvgADC(pinTURB);

  // Basic sanity check: ensure ADC returned something in 0..ADC_MAX
  bool okTDS = (rawTDS >= 0 && rawTDS <= ADC_MAX);
  bool okTURB = (rawTURB >= 0 && rawTURB <= ADC_MAX);

  float vTDS = adcToVoltage(rawTDS);
  float vTURB = adcToVoltage(rawTURB);

  // convert to EC and TDS (approx)
  float ec = voltageToEC(vTDS);
  float tds = ec * (0.5f / Ktemp); // 0.5 is a common conversion factor from EC to TDS; adjust after calibration

  // convert turbidity voltage -> NTU
  float ntu = voltageToNTU(vTURB);

  Serial.print("RAW(TDS): "); Serial.print(rawTDS);
  Serial.print("  V(TDS): "); Serial.print(vTDS, 3);
  Serial.print("  EC: "); Serial.print(ec, 2);
  Serial.print("  TDS(ppm): "); Serial.print(tds, 1);
  Serial.println();

  Serial.print("RAW(TURB): "); Serial.print(rawTURB);
  Serial.print("  V(TURB): "); Serial.print(vTURB, 3);
  Serial.print("  NTU: "); Serial.print(ntu, 1);
  Serial.println();

  Serial.println("-------------------------------");

  // If both reads are valid, blink LED to indicate success
  if (okTDS && okTURB) {
    blinkSuccess(ledPin);
  } else {
    // optional: indicate error by a longer blink
    digitalWrite(ledPin, HIGH);
    delay(400);
    digitalWrite(ledPin, LOW);
  }

  delay(1000); // wait before next reading
}

