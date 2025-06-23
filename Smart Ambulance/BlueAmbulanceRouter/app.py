import os
import logging
import random
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify

# Set up logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Initialize the database
from db import init_app, db
init_app(app)

# Import models after init_app to avoid circular imports
from models import TrafficEvent, AmbulanceDetection, SystemState

# Initialize with some historical data for demonstration
def initialize_sample_data():
    with app.app_context():
        # Check if we already have data
        if TrafficEvent.query.count() > 0:
            return
            
        # Add past traffic events (last 24 hours)
        now = datetime.now()
        states = ["red", "yellow", "green"]
        
        for i in range(48):  # 24 hours with approx 30min intervals
            event_time = now - timedelta(hours=24) + timedelta(minutes=30*i)
            state = states[i % 3]
            traffic_event = TrafficEvent(state=state, timestamp=event_time)
            db.session.add(traffic_event)
        
        # Add a few past ambulance detections
        detection_times = [
            now - timedelta(hours=23),
            now - timedelta(hours=18),
            now - timedelta(hours=12),
            now - timedelta(hours=6),
            now - timedelta(hours=2)
        ]
        
        for dt in detection_times:
            detection = AmbulanceDetection(timestamp=dt)
            db.session.add(detection)
            
        db.session.commit()

initialize_sample_data()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/traffic/status')
def get_traffic_status():
    # Get the latest system state from the database
    system_state = SystemState.query.order_by(SystemState.id.desc()).first()
    
    if not system_state:
        # If no system state exists, create a default one
        system_state = SystemState()
        db.session.add(system_state)
        db.session.commit()
    
    return jsonify({
        'traffic_state': system_state.current_traffic_state,
        'ambulance_detected': system_state.ambulance_detected,
        'system_mode': system_state.system_mode,
        'last_updated': system_state.last_updated.isoformat()
    })

@app.route('/api/traffic/history')
def get_traffic_history():
    # Get the 20 most recent traffic events
    recent_traffic_events = TrafficEvent.query.order_by(TrafficEvent.timestamp.desc()).limit(20).all()
    
    # Get all ambulance detections
    all_ambulance_detections = AmbulanceDetection.query.order_by(AmbulanceDetection.timestamp.desc()).all()
    
    return jsonify({
        'traffic_events': [event.to_dict() for event in recent_traffic_events],
        'ambulance_detections': [detection.to_dict() for detection in all_ambulance_detections]
    })

@app.route('/api/simulate/ambulance/<action>')
def simulate_ambulance(action):
    # Get the current system state
    system_state = SystemState.query.order_by(SystemState.id.desc()).first()
    
    if not system_state:
        system_state = SystemState()
        db.session.add(system_state)
    
    if action == 'detect':
        # Simulate ambulance detection
        system_state.ambulance_detected = True
        system_state.system_mode = "ambulance-priority"
        system_state.current_traffic_state = "green"  # Turn green for ambulance
        system_state.last_updated = datetime.now()
        
        # Add to detection events
        now = datetime.now()
        ambulance_detection = AmbulanceDetection(timestamp=now)
        traffic_event = TrafficEvent(state="green", timestamp=now)
        
        db.session.add(ambulance_detection)
        db.session.add(traffic_event)
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Ambulance detected, traffic light set to green'})
    
    elif action == 'clear':
        # Simulate ambulance passing
        system_state.ambulance_detected = False
        system_state.system_mode = "normal"
        
        # Reset to a random state to simulate normal operation
        system_state.current_traffic_state = random.choice(["red", "yellow", "green"])
        system_state.last_updated = datetime.now()
        
        # Add to traffic events
        now = datetime.now()
        traffic_event = TrafficEvent(state=system_state.current_traffic_state, timestamp=now)
        db.session.add(traffic_event)
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Ambulance cleared, returning to normal operation'})
    
    return jsonify({'status': 'error', 'message': 'Invalid action'})

@app.route('/api/simulate/traffic/cycle')
def simulate_traffic_cycle():
    # Get the current system state
    system_state = SystemState.query.order_by(SystemState.id.desc()).first()
    
    if not system_state:
        system_state = SystemState()
        db.session.add(system_state)
    
    # Only cycle if in normal mode
    if system_state.system_mode == "normal":
        # Cycle through states: red -> green -> yellow -> red
        if system_state.current_traffic_state == "red":
            system_state.current_traffic_state = "green"
        elif system_state.current_traffic_state == "green":
            system_state.current_traffic_state = "yellow"
        elif system_state.current_traffic_state == "yellow":
            system_state.current_traffic_state = "red"
            
        system_state.last_updated = datetime.now()
        
        # Add to traffic events
        now = datetime.now()
        traffic_event = TrafficEvent(state=system_state.current_traffic_state, timestamp=now)
        db.session.add(traffic_event)
        db.session.commit()
        
        return jsonify({
            'status': 'success', 
            'new_state': system_state.current_traffic_state,
            'message': f'Traffic light changed to {system_state.current_traffic_state}'
        })
    
    return jsonify({
        'status': 'info', 
        'message': 'Traffic cycle not changed - system in ambulance priority mode'
    })
