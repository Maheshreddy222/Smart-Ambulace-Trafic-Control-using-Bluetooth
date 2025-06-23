// Main dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
    
    // Set up event listeners
    setupEventListeners();
});

function initDashboard() {
    // Initial data fetch
    updateTrafficStatus();
    updateTrafficHistory();
    
    // Set up regular updates
    setInterval(updateTrafficStatus, 2000);
    setInterval(updateTrafficHistory, 10000);
    
    // Start the traffic cycle simulation (only works in normal mode)
    setInterval(simulateTrafficCycle, 5000);
}

function setupEventListeners() {
    // Ambulance detection simulation buttons
    document.getElementById('detect-ambulance').addEventListener('click', function() {
        simulateAmbulance('detect');
    });
    
    document.getElementById('clear-ambulance').addEventListener('click', function() {
        simulateAmbulance('clear');
    });
    
    // Mode toggle
    document.getElementById('mode-toggle').addEventListener('change', function() {
        if (this.checked) {
            // Toggle to ambulance priority mode
            simulateAmbulance('detect');
        } else {
            // Toggle to normal mode
            simulateAmbulance('clear');
        }
    });
}

function updateTrafficStatus() {
    fetch('/api/traffic/status')
        .then(response => response.json())
        .then(data => {
            // Update traffic light visualization
            updateTrafficLight(data.traffic_state);
            
            // Update ambulance detection status
            updateAmbulanceStatus(data.ambulance_detected);
            
            // Update system mode display
            updateSystemMode(data.system_mode);
            
            // Update last updated time
            document.getElementById('last-updated').textContent = 
                new Date(data.last_updated).toLocaleTimeString();
        })
        .catch(error => console.error('Error fetching traffic status:', error));
}

function updateTrafficHistory() {
    fetch('/api/traffic/history')
        .then(response => response.json())
        .then(data => {
            // Update traffic events timeline
            updateTrafficTimeline(data.traffic_events);
            
            // Update ambulance detection chart
            updateAmbulanceChart(data.ambulance_detections);
        })
        .catch(error => console.error('Error fetching traffic history:', error));
}

function updateAmbulanceStatus(detected) {
    const statusBadge = document.getElementById('ambulance-status');
    const statusText = document.getElementById('ambulance-status-text');
    
    if (detected) {
        statusBadge.classList.add('detected');
        statusBadge.textContent = 'DETECTED';
        statusText.textContent = 'Ambulance is currently in the vicinity';
        
        // Also update the mode toggle
        document.getElementById('mode-toggle').checked = true;
    } else {
        statusBadge.classList.remove('detected');
        statusBadge.textContent = 'NONE';
        statusText.textContent = 'No ambulance currently detected';
        
        // Update the mode toggle
        document.getElementById('mode-toggle').checked = false;
    }
}

function updateSystemMode(mode) {
    const modeDisplay = document.getElementById('system-mode');
    
    if (mode === 'ambulance-priority') {
        modeDisplay.textContent = 'AMBULANCE PRIORITY';
        modeDisplay.className = 'badge bg-danger';
    } else {
        modeDisplay.textContent = 'NORMAL OPERATION';
        modeDisplay.className = 'badge bg-success';
    }
}

function updateTrafficTimeline(events) {
    const timelineContainer = document.getElementById('traffic-timeline');
    
    // Clear existing timeline
    timelineContainer.innerHTML = '';
    
    // Add the most recent 8 events (in reverse chronological order)
    const recentEvents = events.slice(-8).reverse();
    
    recentEvents.forEach(event => {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${event.state}`;
        
        const eventTime = new Date(event.timestamp);
        
        timelineItem.innerHTML = `
            <h6>${formatTimeForDisplay(eventTime)}</h6>
            <p>Traffic light changed to <strong>${event.state.toUpperCase()}</strong></p>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
}

function simulateAmbulance(action) {
    fetch(`/api/simulate/ambulance/${action}`)
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            // Immediate update after simulation
            updateTrafficStatus();
            updateTrafficHistory();
        })
        .catch(error => console.error(`Error simulating ambulance ${action}:`, error));
}

function simulateTrafficCycle() {
    fetch('/api/simulate/traffic/cycle')
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            // The regular updates will handle the UI refresh
        })
        .catch(error => console.error('Error simulating traffic cycle:', error));
}

function formatTimeForDisplay(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
