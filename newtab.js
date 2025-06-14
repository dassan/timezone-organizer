// Review banner config
const REVIEW_CONFIG = {
  minUsageDays: 3,           // At least 3 days of usage
  minTabOpens: 15,           // At least 15 new tabs opened
  minTimezonesAdded: 1,      // At least 1 added time zone
  cooldownDays: 30,          // Postpone 30 days by user decision
  maxShowCount: 3            // Maximum of 3 attempts
};

document.addEventListener('DOMContentLoaded', function() {
  // Default time zones in case nothing is stored yet
  const defaultTimeZones = [];

  // Default hour format (24-hour)
  const defaultHour24 = true;
  
  // Global variable to store the hour format
  let hour12 = false; // This will be set by loadHourFormat()

  // Global variables for scroll feature
  let hourOffset = 0;
  let isMouseOverTime = false;
  
  // Load time zones and hour format
  loadHourFormat();
  
  // Load time zones
  loadTimeZones();
  
  // Add settings toggle button
  addSettingsButton();

  // Load donation message setting and initialize coffee link
  loadDonationMessageSetting();
  initBuyMeCoffeeLink();

  // Init review banner parameters
  initReviewRequestSystem();

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
        window.open('https://bit.ly/timezone-organizer-coffee', '_blank');
        
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
    hourOffset = 0;
    isMouseOverTime = false;

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
      zoneElement.setAttribute('data-timezone', zone.timezone);

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
        month: 'short',
        day: 'numeric'
      };
      
      const dateString = now.toLocaleDateString('en-US', dateOptions);

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
            <div class="day-indicator">${dateString}</div>
            <div class="timezone-name">${zone.name}</div>
          </div>
        `;
      } else {
        zoneElement.innerHTML = `
          <div class="content-group">
            <div class="timezone-time">${hours}<br>${minutes}</div>
            <div class="day-indicator">${dateString}</div>
            <div class="timezone-name">${zone.name}</div>
          </div>
        `;
      }

      container.appendChild(zoneElement);
    });

    setupScrollFeature();
  }

  // Setup scroll listeners
  function setupScrollFeature() {
    const timeElements = document.querySelectorAll('.timezone-time');

    timeElements.forEach(element => {
      // Mouse hover detection
      element.addEventListener('mouseenter', () => {
        isMouseOverTime = true;
        element.style.cursor = 'ns-resize';
      });

      element.addEventListener('mouseleave', () => {
        isMouseOverTime = false;
        element.style.cursor = 'default';
      });

      // Scroll handling
      element.addEventListener('wheel', (e) => {
        if (isMouseOverTime) {
          e.preventDefault();
          hourOffset += e.deltaY > 0 ? -1 : 1; // scroll up = +1 hour, down = -1 hour
          updateTimesWithOffset();
        }
      });
    });
  }

  // Update times with offset
  function updateTimesWithOffset() {
    const timeElements = document.querySelectorAll('.timezone-time');
    const periodElements = document.querySelectorAll('.timezone-time-period');
    const dayElements = document.querySelectorAll('.day-indicator');

    timeElements.forEach((timeEl, index) => {
      // Get timezone from the parent timezone div's data or reconstruct from your existing logic
      const timezoneDiv = timeEl.closest('.timezone');
      const timezone = getTimezoneFromElement(timezoneDiv);

      if (timezone) {
        const now = new Date();
        now.setHours(now.getHours() + hourOffset);

        const timeInZone = new Date(now.toLocaleString("en-US", {timeZone: timezone}));

        const time24 = timeInZone.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        // Format time to match the design (hour on top line, minute on bottom)
        const [hours, minutes] = time24.split(':');
        let period = 'AM';

        // Group all content in the center
        if (hour12 && hours > 12) {
          hours = hours - 12;
          period = 'PM';
        }

        timeEl.innerHTML = `${String(hours).padStart(2, '0')}<br>${String(minutes)}`;
        if (periodElements[index]) {
          periodElements[index].textContent = period;
        }

        if (dayElements[index]) {
          const dayString = timeInZone.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          dayElements[index].textContent = dayString;
        }
      }
    });

    // Show offset indicator
    showOffsetIndicator();
  }

  // Helper function to get timezone from element
  function getTimezoneFromElement(timezoneDiv) {
    return timezoneDiv.dataset.timezone;
  }

  // Simple offset indicator
  function showOffsetIndicator() {
    let indicator = document.getElementById('offset-indicator');
    
    if (hourOffset === 0) {
      if (indicator) indicator.remove();
      return;
    }
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'offset-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 1000;
      `;
      document.body.appendChild(indicator);
    }
    
    indicator.textContent = `${hourOffset > 0 ? '+' : ''}${hourOffset}h`;
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
    
  // Update every minute instead of every second to reduce resource usage
  setInterval(function() {
    loadTimeZones();
  }, 60000); // Update every minute
});

// Review request implementation
function initReviewRequestSystem() {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
    return;
  }

  // Register the visit
  recordTabOpen();
  
  // Verify if the banner should appear
  checkAndShowReviewRequest();
}

function recordTabOpen() {
  chrome.storage.sync.get({
    firstUseDate: null,
    tabOpenCount: 0,
    lastReviewRequest: null,
    reviewRequestCount: 0,
    reviewRequestDismissed: false,
    reviewCompleted: false
  }, function(data) {
    const now = new Date().getTime();
    const updates = {
      tabOpenCount: data.tabOpenCount + 1
    };

    // if this is the first time, register the installation date
    if (!data.firstUseDate) {
      updates.firstUseDate = now;
    }

    chrome.storage.sync.set(updates);
  });
}

function checkAndShowReviewRequest() {
  chrome.storage.sync.get({
    firstUseDate: null,
    tabOpenCount: 0,
    timeZones: [],
    lastReviewRequest: null,
    reviewRequestCount: 0,
    reviewRequestDismissed: false,
    reviewCompleted: false
  }, function(data) {
    
    // If the review was done or dismissed, do not show
    if (data.reviewCompleted || data.reviewRequestDismissed) {
      return;
    }

    // If the banner was already displayed many times, do not insist
    if (data.reviewRequestCount >= REVIEW_CONFIG.maxShowCount) {
      return;
    }

    const now = new Date().getTime();
    const daysSinceFirstUse = data.firstUseDate ? 
      (now - data.firstUseDate) / (1000 * 60 * 60 * 24) : 0;

    const daysSinceLastRequest = data.lastReviewRequest ? 
      (now - data.lastReviewRequest) / (1000 * 60 * 60 * 24) : 999;

    const shouldShow = 
      daysSinceFirstUse >= REVIEW_CONFIG.minUsageDays &&
      data.tabOpenCount >= REVIEW_CONFIG.minTabOpens &&
      data.timeZones.length >= REVIEW_CONFIG.minTimezonesAdded &&
      daysSinceLastRequest >= REVIEW_CONFIG.cooldownDays;

    if (shouldShow) {
      // Wait some seconds to load the page
      setTimeout(() => {
        showReviewRequest();
        
        chrome.storage.sync.set({
          lastReviewRequest: now,
          reviewRequestCount: data.reviewRequestCount + 1
        });
      }, 1500);
    }
  });
}

function showReviewRequest() {
  if (document.getElementById('reviewRequestBanner')) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'reviewRequestBanner';
  banner.className = 'review-request-banner';
  
  banner.innerHTML = `
    <div class="review-banner-content">
      <div class="review-banner-text">
        <div class="review-banner-emoji">⭐</div>
        <div class="review-banner-message">
          <strong>Enjoying TimeZone Organizer?</strong>
          <span>Help others discover it with a quick review!</span>
        </div>
      </div>
      <div class="review-banner-actions">
        <button id="reviewBtn" class="review-btn review-btn-primary">
          Rate Extension
        </button>
        <button id="laterBtn" class="review-btn review-btn-secondary">
          Maybe Later
        </button>
        <button id="dismissBtn" class="review-btn review-btn-text">
          Don't Ask Again
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('reviewBtn').addEventListener('click', function() {
    const extensionId = chrome.runtime.id;
    const reviewUrl = `https://chrome.google.com/webstore/detail/${extensionId}/reviews`;
    window.open(reviewUrl, '_blank');
    
    chrome.storage.sync.set({ reviewCompleted: true });
    
    removeBanner();
  });

  document.getElementById('laterBtn').addEventListener('click', function() {
    removeBanner();
  });

  document.getElementById('dismissBtn').addEventListener('click', function() {
    chrome.storage.sync.set({ reviewRequestDismissed: true });
    removeBanner();
  });

  // Auto remove banner after 12 seconds if user takes no action
  setTimeout(() => {
    if (document.getElementById('reviewRequestBanner')) {
      removeBanner();
    }
  }, 12000);

  function removeBanner() {
    const banner = document.getElementById('reviewRequestBanner');
    if (banner) {
      banner.style.animation = 'slideOutToRight 0.3s ease-in forwards';
      setTimeout(() => {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      }, 300);
    }
  }

}