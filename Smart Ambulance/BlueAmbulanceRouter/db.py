import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def init_app(app):
    # configure the database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }
    # initialize the app with the extension
    db.init_app(app)
    
    # import models here to avoid circular imports
    import models
    
    # create tables
    with app.app_context():
        db.create_all()
        
        # Initialize system state if it doesn't exist
        from models import SystemState
        if not SystemState.query.first():
            initial_state = SystemState(
                current_traffic_state="red",
                ambulance_detected=False,
                system_mode="normal"
            )
            db.session.add(initial_state)
            db.session.commit()