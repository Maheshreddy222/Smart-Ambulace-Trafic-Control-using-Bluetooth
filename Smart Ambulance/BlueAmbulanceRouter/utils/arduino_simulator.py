"""
Arduino and HC-05 Bluetooth Module Simulator for Testing

This utility simulates the behavior of an Arduino with HC-05 Bluetooth module
by generating simulated serial data that would be received from the actual hardware.

In a real deployment, this would be replaced with actual serial communication
with the Arduino hardware.
"""

import random
import time
import threading
import logging

logger = logging.getLogger(__name__)

class ArduinoSimulator:
    def __init__(self):
        self.running = False
        self.callback = None
        self.thread = None
        self.ambulance_detected = False
        
    def start(self, callback=None):
        """Start the Arduino simulator thread."""
        if self.running:
            logger.warning("Arduino simulator is already running.")
            return
            
        self.callback = callback
        self.running = True
        self.thread = threading.Thread(target=self._simulation_loop)
        self.thread.daemon = True
        self.thread.start()
        logger.info("Arduino simulator started.")
        
    def stop(self):
        """Stop the Arduino simulator thread."""
        self.running = False
        if self.thread:
            self.thread.join(timeout=1.0)
        logger.info("Arduino simulator stopped.")
        
    def _simulation_loop(self):
        """Main simulation loop that generates events."""
        while self.running:
            # Simulate normal traffic light cycle
            self._simulate_traffic_cycle()
            
            # Randomly simulate ambulance detection (1% chance per cycle)
            if random.random() < 0.01 and not self.ambulance_detected:
                self._simulate_ambulance_detection()
            
            # If ambulance was detected, clear it after some time
            if self.ambulance_detected and random.random() < 0.3:
                self._simulate_ambulance_cleared()
                
            # Wait between simulation cycles
            time.sleep(random.uniform(2.0, 5.0))
            
    def _simulate_traffic_cycle(self):
        """Simulate normal traffic light cycle."""
        states = ["red", "green", "yellow"]
        state = random.choice(states)
        
        if self.callback:
            self.callback({
                "type": "traffic_update",
                "state": state,
                "timestamp": time.time()
            })
            
        logger.debug(f"Simulated traffic update: {state}")
        
    def _simulate_ambulance_detection(self):
        """Simulate ambulance detection event."""
        self.ambulance_detected = True
        
        if self.callback:
            self.callback({
                "type": "ambulance_detected",
                "timestamp": time.time()
            })
            
        logger.info("Simulated ambulance detection")
        
    def _simulate_ambulance_cleared(self):
        """Simulate ambulance cleared event."""
        self.ambulance_detected = False
        
        if self.callback:
            self.callback({
                "type": "ambulance_cleared",
                "timestamp": time.time()
            })
            
        logger.info("Simulated ambulance cleared")

# Example usage:
if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    
    def event_handler(event):
        print(f"Received event: {event}")
        
    simulator = ArduinoSimulator()
    simulator.start(event_handler)
    
    try:
        # Run for 30 seconds as a test
        time.sleep(30)
    finally:
        simulator.stop()
