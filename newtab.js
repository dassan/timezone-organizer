document.addEventListener('DOMContentLoaded', function() {
  // Default time zones in case nothing is stored yet
  const defaultTimeZones = [
    //{ name: 'Paulinia, Brazil', timezone: 'America/Sao_Paulo', label: 'PLN', bgColor: '#4ba3a9', textColor: '#ffffff' }
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
      zoneElement.style.backgroundColor = zone.bgColor;
      zoneElement.style.color = zone.textColor;
      
      // Get current time in this zone
      const now = new Date();
      const timeOptions = { 
        timeZone: zone.timezone,
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false // Use 24-hour format
      };
      
      const dateOptions = {
        timeZone: zone.timezone,
        weekday: 'short',
        day: 'numeric'
      };
      
      const timeString = now.toLocaleTimeString('en-US', timeOptions);
      const dateString = now.toLocaleDateString('en-US', dateOptions);
      
      // Format time to match the design (hour on top line, minute on bottom)
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