from datetime import datetime
from db import db

class TrafficEvent(db.Model):
    __tablename__ = 'traffic_events'
    
    id = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(10), nullable=False)  # "red", "yellow", or "green"
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'state': self.state,
            'timestamp': self.timestamp.isoformat()
        }

class AmbulanceDetection(db.Model):
    __tablename__ = 'ambulance_detections'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat()
        }

class SystemState(db.Model):
    __tablename__ = 'system_state'

    id = db.Column(db.Integer, primary_key=True)
    current_traffic_state = db.Column(db.String(10), default="red")  # "red", "yellow", or "green"
    ambulance_detected = db.Column(db.Boolean, default=False)
    system_mode = db.Column(db.String(20), default="normal")  # "normal" or "ambulance-priority"
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'current_traffic_state': self.current_traffic_state,
            'ambulance_detected': self.ambulance_detected, 
            'system_mode': self.system_mode,
            'last_updated': self.last_updated.isoformat()
        }
