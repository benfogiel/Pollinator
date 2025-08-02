import time
import json
from machine import Pin
import bluetooth
from micropython import const

from flower import Flower
from util import get_logger, update_persistent_mem
from constants import (
    NAME,
    DATA_PIN,
    NUM_LEDS,
    PEDAL_LENGTH,
    REFRESH_RATE,
    MSG_TERMINATOR,
    BLE_SERVICE_UUID,
    BLE_TX_UUID,
    BLE_RX_UUID,
)

# BLE constants
_IRQ_CENTRAL_CONNECT = const(1)
_IRQ_CENTRAL_DISCONNECT = const(2)
_IRQ_GATTS_WRITE = const(3)

# Nordic UART Service UUID
_UART_UUID = bluetooth.UUID(BLE_SERVICE_UUID)
_UART_TX = (bluetooth.UUID(BLE_TX_UUID), bluetooth.FLAG_NOTIFY,)
_UART_RX = (bluetooth.UUID(BLE_RX_UUID), bluetooth.FLAG_WRITE,)
_UART_SERVICE = (_UART_UUID, (_UART_TX, _UART_RX,),)

# Constants
INACTIVE_LIFETIME = 120  # 2 minutes
MESSAGE_TIMEOUT = 0.1  # 100ms
PERSISTENT_UPDATE_DELAY = 2.0  # seconds

logger = get_logger()


class BLEUARTService:
    def __init__(self, ble, name):
        self._ble = ble
        self._ble.active(True)
        self._ble.irq(self._irq)
        ((self._tx_handle, self._rx_handle,),) = self._ble.gatts_register_services((_UART_SERVICE,))
        self._connections = set()
        self._rx_buffer = bytearray()
        self._name = name
        self.is_connected = False
        
    def _irq(self, event, data):
        if event == _IRQ_CENTRAL_CONNECT:
            conn_handle, _, _ = data
            self._connections.add(conn_handle)
            self.is_connected = True
            logger.info("BLE client connected")
            
        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, _, _ = data
            if conn_handle in self._connections:
                self._connections.remove(conn_handle)
            self.is_connected = len(self._connections) > 0
            logger.info("BLE client disconnected")
            
        elif event == _IRQ_GATTS_WRITE:
            conn_handle, value_handle = data
            if conn_handle in self._connections and value_handle == self._rx_handle:
                value = self._ble.gatts_read(self._rx_handle)
                self._rx_buffer.extend(value)

    def start_advertising(self):
        # Create advertising payload
        name = self._name.encode('utf-8')
        adv_data = bytearray()
        
        # Flags
        adv_data.extend(b'\x02\x01\x06')
        
        # Complete local name
        adv_data.extend(bytes([len(name) + 1, 0x09]) + name)
        
        uuid_bytes = bytes.fromhex(BLE_SERVICE_UUID.replace('-', ''))
        print(uuid_bytes)
        # Reverse byte order for little-endian format
        uuid_bytes = uuid_bytes[::-1]
        adv_data.extend(bytes([len(uuid_bytes) + 1, 0x07]) + uuid_bytes)
        
        self._ble.gap_advertise(100, adv_data)
        
    def stop_advertising(self):
        self._ble.gap_advertise(None)
        
    def read_message(self, timeout=MESSAGE_TIMEOUT) -> str:
        """Read messages from the RX buffer until terminator is reached or timeout"""
        message = ""
        t_start = time.ticks_ms()
        
        while time.ticks_diff(time.ticks_ms(), t_start) < timeout * 1000:
            if self._rx_buffer:
                # Process available data
                try:
                    data = bytes(self._rx_buffer).decode('utf-8')
                    self._rx_buffer.clear()
                    message += data
                    
                    if MSG_TERMINATOR in message:
                        return message.replace(MSG_TERMINATOR, "")
                except UnicodeDecodeError:
                    # Clear buffer if we can't decode
                    self._rx_buffer.clear()
                    continue
            elif message == "":
                return ""
            
            time.sleep_ms(1)  # Small delay to prevent busy waiting
            
        if message:
            logger.error("Timeout reached. Unable to read message stream.")
        return ""

    def disconnect(self):
        """Disconnect all clients"""
        for conn_handle in self._connections.copy():
            self._ble.gap_disconnect(conn_handle)


def update(t_last: float) -> float:
    t_now = time.ticks_ms() / 1000.0
    if t_now - t_last > flower.update_rate:
        flower.update()
        return t_now
    return t_last


# Initialize components
data_pin = Pin(DATA_PIN, Pin.OUT)
flower = Flower(NUM_LEDS, PEDAL_LENGTH, data_pin)

# Initialize BLE
ble = bluetooth.BLE()
uart_service = BLEUARTService(ble, NAME)

t_last = time.ticks_ms() / 1000.0
t_last_msg = time.ticks_ms() / 1000.0
t_last_persistent_update = time.ticks_ms() / 1000.0
pending_persistent_update = False

while True:
    uart_service.start_advertising()
    logger.info("BLE advertising started")
    
    while not uart_service.is_connected:
        # Still update the flower while waiting for connection
        t_last = update(t_last)
        time.sleep(REFRESH_RATE)

    while uart_service.is_connected:
        message = uart_service.read_message()
        if message:
            logger.debug("Received: %s", message)
            t_last_msg = time.ticks_ms() / 1000.0
            try:
                action = json.loads(message)
                flower.pollinate(action)
                pending_persistent_update = True
            except ValueError as e:
                logger.error("Failed to parse JSON: %s", e)
        else:
            # Check if we need to flush pending persistent memory update
            t_now = time.ticks_ms() / 1000.0
            if pending_persistent_update and (t_now - t_last_persistent_update) > PERSISTENT_UPDATE_DELAY:
                update_persistent_mem(flower.get_current_state())
                pending_persistent_update = False
                t_last_persistent_update = t_now
                
            if time.ticks_ms() / 1000.0 - t_last_msg > INACTIVE_LIFETIME:
                logger.info("Inactive lifetime reached, restarting advertisement.")
                uart_service.disconnect()
                break  # disconnect
                
        t_last = update(t_last)
        time.sleep(REFRESH_RATE)

    # If we got here, we lost the connection. Go up to the top and start
    # advertising again and waiting for a connection.
    uart_service.stop_advertising()