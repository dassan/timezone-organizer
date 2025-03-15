document.addEventListener('DOMContentLoaded', function() {
  // Default time zones in case nothing is stored yet
  const defaultTimeZones = [
    { name: 'Paulinia, Brazil', timezone: 'America/Sao_Paulo', label: 'PLN', bgColor: 'auto', textColor: '#ffffff' }
  ];
  
  // Load time zones
  loadTimeZones();
  
  // Add settings toggle button
  addSettingsButton();
  
  // Function to load time zones from Chrome storage
  function loadTimeZones() {
    // Check if chrome.storage is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      // Chrome storage API is available, use it
      chrome.storage.sync.get({ timeZones: defaultTimeZones }, function(data) {
        updateTimezoneDisplay(data.timeZones);
      });
    } else {
      // Chrome storage API is not available, use default time zones
      console.log('Chrome storage API not available. Using default time zones.');
      updateTimezoneDisplay(defaultTimeZones);
    }
  }

  // Function to generate a color based on the hour (0-23)
  function getColorForHour(hour) {
    // Early morning (midnight to 6am): dark blue to purple
    if (hour >= 0 && hour < 6) {
      const ratio = hour / 6;
      return interpolateColor('#1a237e', '#4a148c', ratio);
    }
    // Morning (6am to 12pm): purple to teal
    else if (hour >= 6 && hour < 12) {
      const ratio = (hour - 6) / 6;
      return interpolateColor('#4a148c', '#00796b', ratio);
    }
    // Afternoon (12pm to 6pm): teal to orange
    else if (hour >= 12 && hour < 18) {
      const ratio = (hour - 12) / 6;
      return interpolateColor('#00796b', '#e65100', ratio);
    }
    // Evening (6pm to midnight): orange to dark blue
    else {
      const ratio = (hour - 18) / 6;
      return interpolateColor('#e65100', '#1a237e', ratio);
    }
  }

  // Helper function to interpolate between two colors
  function interpolateColor(color1, color2, ratio) {
    // Convert hex to RGB
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    // Interpolate
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Function to generate a contrasting text color (black or white) based on background color
  function getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    
    // Calculate luminance - human eye favors green color
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for bright colors and white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
  
  // Function to update the display with the given time zones
  function updateTimezoneDisplay(timeZones) {
    const container = document.getElementById('timezones');
    if (!container) {
      console.error('Timezone container element not found');
      return;
    }
    
    container.innerHTML = ''; // Clear existing content

    // Check if timeZones array is empty
    if (timeZones.length === 0) {
      // Create empty state message
      const emptyStateDiv = document.createElement('div');
      emptyStateDiv.className = 'empty-timezone-message';
      
      emptyStateDiv.innerHTML = `
        <h2>Welcome to Your Time Zone Dashboard!</h2>
        <p>Thank you for downloading this extension. We're excited to help you keep track of time across the globe.</p>
        <p>To get started, click the settings button <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> in the bottom right corner to add your first time zone.</p>
        <div class="welcome-benefits">
          <div class="benefit-item">
            <div class="benefit-icon">🌎</div>
            <div class="benefit-text">Track time across multiple locations</div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">🎨</div>
            <div class="benefit-text">Customize colors for each time zone</div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">⚡</div>
            <div class="benefit-text">See updates in real-time</div>
          </div>
        </div>
      `;

      container.appendChild(emptyStateDiv);
      return;
    }
    
    timeZones.forEach(zone => {
      // Create time zone element
      const zoneElement = document.createElement('div');
      zoneElement.className = 'timezone';

      // Get current time in this zone
      const now = new Date();
      const timeOptions = { 
        timeZone: zone.timezone,
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false // Use 24-hour format
      };

      const timeString = now.toLocaleTimeString('en-US', timeOptions);

      // Format time to match the design (hour on top line, minute on bottom)
      const [hours, minutes] = timeString.split(':');

      // Get color based on current hour in this timezone if no color is specified
      let bgColor = zone.bgColor;
      let textColor = zone.textColor;

      if (!bgColor || bgColor === 'auto') {
        bgColor = getColorForHour(parseInt(hours));
        textColor = getContrastColor(bgColor);
      }

      zoneElement.style.backgroundColor = bgColor;
      zoneElement.style.color = textColor; // zone.textColor

      const dateOptions = {
        timeZone: zone.timezone,
        weekday: 'short',
        day: 'numeric'
      };
      
      const dateString = now.toLocaleDateString('en-US', dateOptions);
           
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
  
  // Add a settings button to open options page
  function addSettingsButton() {
    const container = document.querySelector('.container');
    if (!container) {
      console.error('Container element not found');
      return;
    }
    
    // Check if the button already exists to avoid duplicates
    if (document.getElementById('settingsButton')) {
      return;
    }
    
    const settingsButton = document.createElement('button');
    settingsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
    settingsButton.id = 'settingsButton';
    settingsButton.style.position = 'fixed';
    settingsButton.style.bottom = '20px';
    settingsButton.style.right = '20px';
    settingsButton.style.background = 'rgba(30, 30, 30, 0.6)';
    settingsButton.style.color = 'white';
    settingsButton.style.border = 'none';
    settingsButton.style.borderRadius = '50%';
    settingsButton.style.width = '48px';
    settingsButton.style.height = '48px';
    settingsButton.style.cursor = 'pointer';
    settingsButton.style.zIndex = '1000';
    settingsButton.style.fontFamily = "'Inter', sans-serif";
    settingsButton.style.opacity = '0.6';
    settingsButton.style.transition = 'all 0.3s ease';
    settingsButton.style.display = 'flex';
    settingsButton.style.alignItems = 'center';
    settingsButton.style.justifyContent = 'center';
    settingsButton.style.backdropFilter = 'blur(4px)';
    settingsButton.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    
    settingsButton.addEventListener('mouseover', function() {
      this.style.opacity = '1';
      this.style.transform = 'scale(1.05)';
      this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    });
    
    settingsButton.addEventListener('mouseout', function() {
      this.style.opacity = '0.6';
      this.style.transform = 'scale(1)';
      this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    });
    
    settingsButton.addEventListener('click', function() {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        console.log('Options page not available in this context');
        alert('Settings are not available when running this page outside of a Chrome extension context.');
      }
    });
    
    container.appendChild(settingsButton);
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
  
  // Update every minute instead of every second to reduce resource usage
  setInterval(function() {
    loadTimeZones();
  }, 60000); // Update every minute
});