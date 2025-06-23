// Chart.js Configuration for Dashboard

// Initialize ambulance detection chart
let ambulanceChart = null;

function updateAmbulanceChart(detections) {
    // Process data for chart
    const timestamps = detections.map(d => new Date(d.timestamp));
    
    // Sort timestamps chronologically
    timestamps.sort((a, b) => a - b);
    
    // Format dates for display
    const labels = timestamps.map(t => {
        return t.toLocaleDateString() + ' ' + 
               t.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    });
    
    // Count detections by hour for the histogram
    const hourCounts = countDetectionsByHour(timestamps);
    
    // Create or update chart
    const ctx = document.getElementById('ambulance-chart').getContext('2d');
    
    if (ambulanceChart) {
        // Update existing chart
        ambulanceChart.data.labels = Array.from({length: 24}, (_, i) => `${i}:00`);
        ambulanceChart.data.datasets[0].data = hourCounts;
        ambulanceChart.update();
    } else {
        // Create new chart
        ambulanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Ambulance Detections by Hour',
                    data: hourCounts,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgb(220, 53, 69)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return `Hour: ${tooltipItems[0].label}`;
                            },
                            label: function(context) {
                                return `Detections: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day',
                            color: '#fff'
                        },
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Detections',
                            color: '#fff'
                        },
                        ticks: {
                            precision: 0,
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    // Update recent detections list
    updateRecentDetections(detections);
}

function countDetectionsByHour(timestamps) {
    // Initialize array with zeros for each hour (0-23)
    const hourCounts = Array(24).fill(0);
    
    // Count detections for each hour
    timestamps.forEach(timestamp => {
        const hour = timestamp.getHours();
        hourCounts[hour]++;
    });
    
    return hourCounts;
}

function updateRecentDetections(detections) {
    const recentList = document.getElementById('recent-detections');
    
    // Clear existing list
    recentList.innerHTML = '';
    
    // Sort detections by timestamp (newest first)
    const sortedDetections = [...detections].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Take the 5 most recent detections
    const recentDetections = sortedDetections.slice(0, 5);
    
    if (recentDetections.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'list-group-item bg-dark text-light';
        emptyItem.textContent = 'No recent detections';
        recentList.appendChild(emptyItem);
    } else {
        recentDetections.forEach(detection => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item bg-dark text-light border-secondary';
            
            const detectionTime = new Date(detection.timestamp);
            const timeString = detectionTime.toLocaleString();
            
            listItem.innerHTML = `
                <span class="badge bg-danger me-2">Ambulance</span>
                <span>${timeString}</span>
            `;
            
            recentList.appendChild(listItem);
        });
    }
}
