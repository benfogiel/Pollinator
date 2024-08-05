#include <vector>
#include <NimBLEDevice.h>
#include <ArduinoJson.h>
#include <FastLED.h>

#define NUM_LEDS 25
#define PEDAL_LENGTH 5 // Number of LEDs for each pedal
#define DATA_PIN 18
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB // Order of colors - can be RGB, GRB, etc. depending on your strip

CRGB leds[NUM_LEDS];

const std::string FLOWER_NAME = "Flower1";
bool rainbowSwirlActive = false;

const char* SERVICE_UUID = "3a90e639-5352-473a-bb0b-513d2d7ca5a6";
const char* CHARACTERISTIC_UUID = "e7bbf8d3-185e-467f-ad48-8c0fddf65739";
NimBLEServer *pServer = NULL;
NimBLECharacteristic *pCharacteristic = NULL;

class FlowerLED {
  public:
    FlowerLED(int num_leds, int pedal_length)
      : _num_leds(num_leds), _pedal_length(pedal_length) {}

    CRGB parseHexColor(String hex) {
        hex.trim(); // Trim any whitespace
        if (hex.startsWith("#")) {
            hex = hex.substring(1); // Remove the '#' character
        }
        long number = strtol(hex.c_str(), NULL, 16);
        return CRGB((number >> 16) & 0xFF, (number >> 8) & 0xFF, number & 0xFF);
    }

    std::vector<int> getPedalLeds(int pedalIndex) {
      std::vector<int> indices;
      int startingIndex = pedalIndex * _pedal_length;
      for (int i = startingIndex; i < startingIndex + _pedal_length && i < _num_leds; i++) {
          indices.push_back(i);
      }
      return indices;
    }

    void setPedalLeds(int pedalIndex, CRGB color) {
      std::vector<int> pedalLeds = getPedalLeds(pedalIndex);
      for (int i = 0; i < pedalLeds.size(); i++) {
          leds[pedalLeds[i]] = color;
      }
      FastLED.show();
    }

    void setColorAll(String hexColor) {
      CRGB color = parseHexColor(hexColor);

      for (int i = 0; i < _num_leds; i++) {
        leds[i] = color;
      }
      FastLED.show();
    }

    void rainbowSwirl() {
      for (int i = 0; i < _num_leds; i++) {
        leds[i] = CHSV(i * 256 / _num_leds, 255, 255); // CHSV(hue, saturation, value)
      }
      FastLED.show();
    }

    void updateRainbowSwirl() {
      CRGB temp = leds[_num_leds - 1];
      
      for (int i = _num_leds - 1; i > 0; i--) {
        leds[i] = leds[i - 1];
      }
      
      leds[0] = temp;
      FastLED.show();
    }

  private:
    int _num_leds;
    int _pedal_length;
};

FlowerLED* flowerLED = new FlowerLED(NUM_LEDS, PEDAL_LENGTH);

void pollinateAction(JsonArray array) {
  rainbowSwirlActive = false;
  
  for (JsonVariant v : array) {
      String cmd = v.as<String>();

      if (cmd.startsWith("#") && cmd.length() == 7) {
          Serial.println("Setting to color " + cmd);
          flowerLED->setColorAll(cmd);
      } else if (cmd == "rainbow_swirl") {
          Serial.println("Starting rainbow swirl");
          flowerLED->rainbowSwirl();
          rainbowSwirlActive = true;
      } else {
        Serial.print("unknown command: ");
        Serial.println(cmd);
      }
  }
}

class CharacteristicsCallbacks : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* pCharacteristic) {
      std::string value = pCharacteristic->getValue();
      Serial.print("Received Value: ");
      Serial.println(value.c_str());

      if (value == "ping") {
        return;
      }

      DynamicJsonDocument doc(1024);
      deserializeJson(doc, value);
      JsonArray cmdArray = doc.as<JsonArray>();
      pollinateAction(cmdArray);
  }
};

class ServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* pServer) {
      Serial.println("Device connected");
  }

  void onDisconnect(NimBLEServer* pServer) {
      Serial.println("Device disconnected");
      // Restart advertising
      pServer->startAdvertising();
  }
};

void setup() {
  Serial.begin(115200);
  delay(5000); // wait for serial to initialize

  // -- BLE Setup -- //
  NimBLEDevice::init(FLOWER_NAME);

  NimBLEServer *pServer = NimBLEDevice::createServer();
  NimBLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID);

  pServer->setCallbacks(new ServerCallbacks());
  pCharacteristic->setCallbacks(new CharacteristicsCallbacks());
  pCharacteristic->setValue("LED Flower Controller");
  
  pService->start();

  NimBLEAdvertising *pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID); 
  pAdvertising->start(); 

  Serial.println("BLE Server started");

  // -- LED Setup -- //
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(200); // Set initial brightness (0-255)
}

void loop() {
  if (rainbowSwirlActive) {
    flowerLED->updateRainbowSwirl();
    delay(100); // Adjust the delay to control the speed of the swirl
  } else {
    delay(1000);
  }
}