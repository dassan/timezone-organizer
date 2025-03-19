document.addEventListener('DOMContentLoaded', function() {
  // Default time zones in case nothing is stored yet
  const defaultTimeZones = [];

  // Default hour format (24-hour)
  const defaultHour24 = true;
  
  // Global variable to store the hour format
  let hour12 = false; // This will be set by loadHourFormat()
  
  // Load time zones and hour format
  loadHourFormat();
  
  // Load time zones
  loadTimeZones();
  
  // Add settings toggle button
  addSettingsButton();

  // Load donation message setting and initialize coffee link
  loadDonationMessageSetting();
  initBuyMeCoffeeLink();

  // Load the donation message visibility setting
  function loadDonationMessageSetting() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get({ showDonationMessage: true }, function(data) {
        updateDonationFooter(data.showDonationMessage);
      });
    } else {
      console.log('Chrome storage API not available. Not showing donation message.');
      updateDonationFooter(false);
    }
  }

  // Update the donation footer visibility
  function updateDonationFooter(show) {
    const footer = document.getElementById('donation-footer');
    if (footer) {
      if (show) {
        footer.classList.remove('hidden');
      } else {
        footer.classList.add('hidden');
      }
    }
  }

  // Initialize the Buy Me a Coffee link
  function initBuyMeCoffeeLink() {
    const coffeeLink = document.getElementById('buyMeCoffeeLink');
    if (coffeeLink) {
      coffeeLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Open your Buy Me a Coffee link in a new tab
        window.open('https://www.buymeacoffee.com/yourname', '_blank');
        
        // Optional: Hide the message after clicking (user has seen it)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.set({ showDonationMessage: false });
          updateDonationFooter(false);
        }
      });
    }
  }

  // Function to load hour format from Chrome storage
  function loadHourFormat() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get({ hour24: defaultHour24 }, function(data) {
        hour12 = !data.hour24; // Convert to hour12 format
        // If time zones are already loaded, update the display
        if (window.currentTimeZones) {
          updateTimezoneDisplay(window.currentTimeZones);
        }
      });
    } else {
      console.log('Chrome storage API not available. Using default hour format.');
      hour12 = !defaultHour24;
    }
  }
  
  // Function to load time zones from Chrome storage
  function loadTimeZones() {
    // Check if chrome.storage is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      // Chrome storage API is available, use it
      chrome.storage.sync.get({ timeZones: defaultTimeZones }, function(data) {
        window.currentTimeZones = data.timeZones; // Store for potential updates
        updateTimezoneDisplay(data.timeZones);
      });
    } else {
      // Chrome storage API is not available, use default time zones
      console.log('Chrome storage API not available. Using default time zones.');
      window.currentTimeZones = defaultTimeZones;
      updateTimezoneDisplay(defaultTimeZones);
    }
  }
  
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
    const hourColors = {
      0: '#353b4f',
      1: '#3d4259',
      2: '#464b64',
      3: '#4e546e',
      4: '#5d6483',
      5: '#7a80a0',
      6: '#9ba3c2',
      7: '#b6c0da',
      8: '#c5d3e5',
      9: '#d6e5ec',
      10: '#e4ecd9',
      11: '#eeecc0',
      12: '#f5f0c6',
      13: '#f7edd0',
      14: '#f9e0c0',
      15: '#f9d0b3',
      16: '#f0c4b1',
      17: '#e8b8ae',
      18: '#b6c0da',
      19: '#9ba3c2',
      20: '#7a80a0',
      21: '#5d6483',
      22: '#464b64',
      23: '#353b4f'
    };

    return hourColors[hour] || '#000000'; // Fallback to black if hour not found
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
    return luminance > 0.5 ? '#2A2D3A' : '#D8D8D8';
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
      let bgColor = getColorForHour(parseInt(hours));
      let textColor = getContrastColor(bgColor);

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
      if (hour12) {
        let hourAMPM = hours;
        let period = 'AM';

        if (hours > 12) {
          hourAMPM = hours - 12;
          period = 'PM';
        }

        zoneElement.innerHTML = `
          <div class="content-group">
            <div class="timezone-time">${String(hourAMPM).padStart(2, '0')}<br>${minutes}</div>
            <div class="timezone-time-period">${period}</div>
            <div class="day-indicator">${dateString.split(',')[0]}. ${dayIndicator}</div>
            <div class="timezone-name">${zone.name}</div>
          </div>
        `;
      } else {
        zoneElement.innerHTML = `
          <div class="content-group">
            <div class="timezone-time">${hours}<br>${minutes}</div>
            <div class="day-indicator">${dateString.split(',')[0]}. ${dayIndicator}</div>
            <div class="timezone-name">${zone.name}</div>
          </div>
        `;
      }

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
    settingsButton.style.bottom = '10px';
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