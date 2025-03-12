document.addEventListener('DOMContentLoaded', function() {
    // Hardcoded time zones for MVP
    const timeZones = [
      { name: 'New York', timezone: 'America/New_York', label: 'NYC' },
      { name: 'London', timezone: 'Europe/London', label: 'LON' },
      { name: 'Tokyo', timezone: 'Asia/Tokyo', label: 'TYO' }
    ];
    
    function updateTimes() {
      const container = document.getElementById('timezones');
      container.innerHTML = ''; // Clear existing content
      
      timeZones.forEach(zone => {
        // Create time zone element
        const zoneElement = document.createElement('div');
        zoneElement.className = 'timezone';
        
        // Get current time in this zone
        const now = new Date();
        const options = { 
          timeZone: zone.timezone,
          hour: 'numeric', 
          minute: 'numeric',
          hour12: true // For 12-hour format, use false for 24-hour
        };
        const timeString = now.toLocaleTimeString('en-US', options);
        
        // Determine if it's day or night (simple approximation)
        const hourOptions = { timeZone: zone.timezone, hour: 'numeric', hour12: false };
        const hour = parseInt(now.toLocaleTimeString('en-US', hourOptions));
        
        if (hour >= 6 && hour < 18) {
          zoneElement.classList.add('daytime');
        } else {
          zoneElement.classList.add('nighttime');
        }
        
        // Add content
        zoneElement.innerHTML = `
          <div class="timezone-name">${zone.name} (${zone.label})</div>
          <div class="timezone-time">${timeString}</div>
        `;
        
        container.appendChild(zoneElement);
      });
    }
    
    // Initial update
    updateTimes();
    
    // Update every minute
    setInterval(updateTimes, 60000);
  });