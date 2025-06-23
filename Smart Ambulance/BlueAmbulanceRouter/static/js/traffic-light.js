// Traffic light visualization functions

function updateTrafficLight(state) {
    // Reset all lights
    document.querySelectorAll('.light').forEach(light => {
        light.classList.remove('active');
    });
    
    // Activate the correct light
    const activeLight = document.querySelector(`.light.${state}`);
    if (activeLight) {
        activeLight.classList.add('active');
    }
    
    // Update the traffic state text display
    const stateDisplay = document.getElementById('traffic-state');
    if (stateDisplay) {
        stateDisplay.textContent = state.toUpperCase();
        
        // Update the color class
        stateDisplay.className = 'badge'; // Clear existing classes
        
        if (state === 'red') {
            stateDisplay.classList.add('bg-danger');
        } else if (state === 'yellow') {
            stateDisplay.classList.add('bg-warning');
        } else if (state === 'green') {
            stateDisplay.classList.add('bg-success');
        }
    }
}

// Draw system architecture diagram using SVG
function drawSystemArchitecture() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "300");
    svg.setAttribute("viewBox", "0 0 800 300");
    svg.style.maxWidth = "800px";
    svg.style.margin = "0 auto";
    svg.style.display = "block";
    
    // Define components with their positions
    const components = [
        { id: "ambulance", x: 50, y: 50, width: 120, height: 60, text: "Ambulance", color: "#dc3545" },
        { id: "bluetooth", x: 200, y: 50, width: 120, height: 60, text: "HC-05 Bluetooth", color: "#0d6efd" },
        { id: "arduino", x: 350, y: 50, width: 120, height: 60, text: "Arduino Uno", color: "#198754" },
        { id: "traffic-light", x: 500, y: 50, width: 120, height: 60, text: "Traffic Lights", color: "#6c757d" },
        { id: "flask", x: 350, y: 150, width: 120, height: 60, text: "Flask Backend", color: "#0dcaf0" },
        { id: "database", x: 200, y: 230, width: 120, height: 60, text: "Database", color: "#6610f2" },
        { id: "dashboard", x: 500, y: 230, width: 120, height: 60, text: "Web Dashboard", color: "#fd7e14" }
    ];
    
    // Define connections between components
    const connections = [
        { from: "ambulance", to: "bluetooth", text: "Signal" },
        { from: "bluetooth", to: "arduino", text: "Data" },
        { from: "arduino", to: "traffic-light", text: "Control" },
        { from: "arduino", to: "flask", text: "Serial" },
        { from: "flask", to: "database", text: "Store" },
        { from: "flask", to: "dashboard", text: "Update" },
        { from: "database", to: "dashboard", text: "Read" }
    ];
    
    // Draw components
    components.forEach(comp => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("id", comp.id);
        rect.setAttribute("x", comp.x);
        rect.setAttribute("y", comp.y);
        rect.setAttribute("width", comp.width);
        rect.setAttribute("height", comp.height);
        rect.setAttribute("rx", "10");
        rect.setAttribute("ry", "10");
        rect.setAttribute("fill", comp.color);
        rect.setAttribute("stroke", "#fff");
        rect.setAttribute("stroke-width", "2");
        svg.appendChild(rect);
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", comp.x + comp.width/2);
        text.setAttribute("y", comp.y + comp.height/2);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "#fff");
        text.setAttribute("font-weight", "bold");
        text.textContent = comp.text;
        svg.appendChild(text);
    });
    
    // Draw connections
    connections.forEach(conn => {
        const fromComp = components.find(c => c.id === conn.from);
        const toComp = components.find(c => c.id === conn.to);
        
        if (fromComp && toComp) {
            // Calculate line coordinates
            const startX = fromComp.x + fromComp.width;
            const startY = fromComp.y + fromComp.height/2;
            const endX = toComp.x;
            const endY = toComp.y + toComp.height/2;
            
            // For vertical connections, use an S-curve with two control points
            if (Math.abs(startY - endY) > 50) {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const midX = (startX + endX) / 2;
                
                path.setAttribute("d", `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", "#fff");
                path.setAttribute("stroke-width", "2");
                path.setAttribute("marker-end", "url(#arrowhead)");
                svg.appendChild(path);
            } else {
                // For horizontal connections, use a straight line
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", startX);
                line.setAttribute("y1", startY);
                line.setAttribute("x2", endX);
                line.setAttribute("y2", endY);
                line.setAttribute("stroke", "#fff");
                line.setAttribute("stroke-width", "2");
                line.setAttribute("marker-end", "url(#arrowhead)");
                svg.appendChild(line);
            }
            
            // Add text to the connection if needed
            if (conn.text) {
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", (startX + endX) / 2);
                text.setAttribute("y", (startY + endY) / 2 - 10);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("fill", "#fff");
                text.setAttribute("font-size", "12");
                text.textContent = conn.text;
                svg.appendChild(text);
            }
        }
    });
    
    // Create arrow marker definition
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "10");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");
    
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
    polygon.setAttribute("fill", "#fff");
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // Append the SVG to the container
    document.getElementById('system-architecture').appendChild(svg);
}
