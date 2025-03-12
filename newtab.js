document.addEventListener('DOMContentLoaded', function() {
    // Extended time zones to match the image
    const timeZones = [
      { name: 'Honolulu, HI, United States', timezone: 'Pacific/Honolulu', label: 'HNL', class: 'honolulu' },
      { name: 'Anchorage, AL, United States', timezone: 'America/Anchorage', label: 'ANC', class: 'anchorage' },
      { name: 'Salt Lake City, UT, United States', timezone: 'America/Denver', label: 'SLC', class: 'salt-lake' },
      { name: 'Georgetown, Guyana', timezone: 'America/Guyana', label: 'GEO', class: 'georgetown' },
      { name: 'London, United Kingdom', timezone: 'Europe/London', label: 'LON', class: 'london' },
      { name: 'Abu Dhabi, UAE', timezone: 'Asia/Dubai', label: 'AUH', class: 'abu-dhabi' },
      { name: 'Kathmandu, Nepal', timezone: 'Asia/Kathmandu', label: 'KTM', class: 'kathmandu' },
      { name: 'Jakarta, Indonesia', timezone: 'Asia/Jakarta', label: 'JKT', class: 'jakarta' },
      { name: 'Tokyo, Japan', timezone: 'Asia/Tokyo', label: 'TYO', class: 'tokyo' },
      { name: 'Auckland, New Zealand', timezone: 'Pacific/Auckland', label: 'AKL', class: 'auckland' }
    ];
    
    function updateTimes() {
      const container = document.getElementById('timezones');
      container.innerHTML = ''; // Clear existing content
      
      timeZones.forEach(zone => {
        // Create time zone element
        const zoneElement = document.createElement('div');
        zoneElement.className = `timezone ${zone.class}`;
        
        // Get current time in this zone
        const now = new Date();
        const timeOptions = { 
          timeZone: zone.timezone,
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false // Use 24-hour format as shown in the image
        };
        
        const dateOptions = {
          timeZone: zone.timezone,
          weekday: 'short',
          day: 'numeric'
        };
        
        const timeString = now.toLocaleTimeString('en-US', timeOptions);
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        
        // Format time to match the image (hour on top line, minute on bottom)
        const [hours, minutes] = timeString.split(':');
        
        // Get day indicator (1st, 2nd, etc.)
        const day = new Date(now.toLocaleDateString('en-US', {
          timeZone: zone.timezone,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        })).getDate();
        
        const dayIndicator = getDayIndicator(day);
        
        // Group all content in the center
        zoneElement.innerHTML = `
          <div class="content-group">
            <div class="timezone-time">${hours}<br>${minutes}</div>
            <div class="day-indicator">${dateString.split(',')[0]}. ${dayIndicator}</div>
            <div class="timezone-name">${zone.name}</div>
          </div>
        `;
        
        container.appendChild(zoneElement);
      });
    }
    
    // Helper function to get day indicator (1st, 2nd, 3rd, etc.)
    function getDayIndicator(day) {
      if (day > 3 && day < 21) return day + 'th';
      switch (day % 10) {
        case 1: return day + 'st';
        case 2: return day + 'nd';
        case 3: return day + 'rd';
        default: return day + 'th';
      }
    }
    
    // Initial update
    updateTimes();
    
    // Update every second
    setInterval(updateTimes, 1000);
  });