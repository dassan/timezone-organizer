document.addEventListener('DOMContentLoaded', function() {
  // Default time zones in case nothing is stored yet
  const defaultTimeZones = [];
  // Default hour format (24-hour)
  const defaultHour24 = true;

  // Initialize storage with default or stored data
  initializeTimeZones();
  initializeHourFormat();

  // Initialize UI elements
  document.getElementById('addButton').addEventListener('click', showAddForm);
  document.getElementById('cancelButton').addEventListener('click', hideAddForm);
  document.getElementById('saveButton').addEventListener('click', saveNewTimeZone);
  document.getElementById('backButton').addEventListener('click', function() {
    // Navigate to the new tab page
    window.location.href = 'newtab.html';
  });

  // Add event listener for the hour format toggle
  document.getElementById('hour24Toggle').addEventListener('change', function() {
    saveHourFormat(this.checked);
  });
  
  populateTimezoneDatalist();

  // Initialize hour format from storage
  function initializeHourFormat() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get({ hour24: defaultHour24 }, function(data) {
        document.getElementById('hour24Toggle').checked = data.hour24;
      });
    } else {
      console.log('Chrome storage API not available. Using default hour format.');
      document.getElementById('hour24Toggle').checked = defaultHour24;
    }
  }

  // Save hour format to storage
  function saveHourFormat(hour24) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ hour24: hour24 }, function() {
        console.log('Hour format saved: ' + (hour24 ? '24-hour' : '12-hour'));
      });
    } else {
      console.log('Chrome storage API not available. Hour format change not saved.');
    }
  }

  // Get the GMT offset in minutes for a timezone
  function getGMTOffset(timezone) {
    try {
      // Create a date object for the current time
      const now = new Date();
      
      // Get the UTC timestamp
      const utcTimestamp = now.getTime() + now.getTimezoneOffset() * 60000;
      
      // Create a date string with the timezone
      const dateString = new Date(utcTimestamp).toLocaleString("en-US", {
        timeZone: timezone
      });
      
      // Create a new date object from this string
      const localDate = new Date(dateString);
      
      // Calculate the offset in minutes
      const offset = (localDate.getTime() - utcTimestamp) / 60000;
      
      return offset;
    } catch (error) {
      console.error(`Error calculating offset for ${timezone}:`, error);
      return 0; // Return 0 as default offset if there's an error
    }
  }
  
  // Sort timezones by GMT offset
  function sortTimeZonesByOffset(timeZones) {
    return timeZones.sort((a, b) => {
      const offsetA = getGMTOffset(a.timezone);
      const offsetB = getGMTOffset(b.timezone);
      return offsetA - offsetB;
    });
  }

  // Initialize time zones from storage or defaults, then load options
  function initializeTimeZones() {
    // Check if Chrome storage API is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      // Use Chrome storage
      chrome.storage.sync.get({ timeZones: defaultTimeZones }, function(data) {
        // Sort the time zones before loading
        const sortedTimeZones = sortTimeZonesByOffset(data.timeZones);
        loadOptions(sortedTimeZones);
      });
    } else {
      // Fall back to default time zones, but sort them first
      console.log('Chrome storage API not available. Using default time zones.');
      const sortedDefaultTimeZones = sortTimeZonesByOffset(defaultTimeZones);
      loadOptions(sortedDefaultTimeZones);
    }
  }

  // Function to get a random color from the hour colors palette
  function getRandomPaletteColor() {
    // Array of colors from the getColorForHour function
    const colorPalette = [
      '#353b4f', '#3d4259', '#464b64', '#4e546e', '#5d6483',
      '#7a80a0', '#9ba3c2', '#b6c0da', '#c5d3e5', '#d6e5ec',
      '#e4ecd9', '#eeecc0', '#f5f0c6', '#f7edd0', '#f9e0c0',
      '#f9d0b3', '#f0c4b1', '#e8b8ae',
    ];
    
    // Get a random index from the array
    const randomIndex = Math.floor(Math.random() * colorPalette.length);
    
    // Return the color at the random index
    return colorPalette[randomIndex];
  }

  // Load options with the provided time zones
  function loadOptions(timeZones) {
    const container = document.getElementById('timeZonesList');
    if (!container) {
      console.error('Time zones list container not found');
      return;
    }

    container.innerHTML = ''; // Clear existing content

    const listOfTimezonesTitle = document.createElement('div');
    listOfTimezonesTitle.innerHTML = `<h2>List of Time Zones</h2>`;
    container.appendChild(listOfTimezonesTitle);

    // Check if timeZones array is empty
    if (timeZones.length === 0) {
        // Create empty state message
        const emptyStateDiv = document.createElement('div');
        emptyStateDiv.className = 'empty-timezone-message';
        
        emptyStateDiv.innerHTML = `
            <p><i>Empty list.</i></p>
        `;

        container.appendChild(emptyStateDiv);
    }

    timeZones.forEach((zone, index) => {
      const zoneElement = document.createElement('div');
      zoneElement.className = 'time-zone-item';

      // Create color preview
      const colorPreview = document.createElement('div');
      colorPreview.className = 'color-preview';
      colorPreview.style.backgroundColor = zone.bgColor;
      colorPreview.style.color = zone.textColor;
      colorPreview.textContent = zone.label;

      // Create zone info
      const zoneInfo = document.createElement('div');
      zoneInfo.className = 'zone-info';
      zoneInfo.innerHTML = `
        <div class="zone-name">${zone.name}</div>
        <div class="zone-timezone">${zone.timezone}</div>
      `;

      // Create actions container
      const zoneActions = document.createElement('div');
      zoneActions.className = 'zone-actions';

      // Create edit button
      const editButton = document.createElement('button');
      editButton.className = 'edit-button';
      editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
      editButton.addEventListener('click', function() {
        editTimeZone(index);
      });

      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
      deleteButton.addEventListener('click', function() {
        deleteTimeZone(index);
      });

      zoneActions.appendChild(editButton);
      zoneActions.appendChild(deleteButton);

      zoneElement.appendChild(colorPreview);
      zoneElement.appendChild(zoneInfo);
      zoneElement.appendChild(zoneActions);

      container.appendChild(zoneElement);
    });

    // Store the time zones for other functions to use
    window.currentTimeZones = timeZones;
  }

  // Using datalist for searchable dropdown
  function populateTimezoneDatalist() {
    const timezoneInput = document.getElementById('timezone');
    const timezoneDatalist = document.getElementById('timezoneList');
    if (!timezoneInput || !timezoneDatalist) return;
    
    // Clear existing options
    timezoneDatalist.innerHTML = '';
    
    // Add all timezones to the datalist (imported from timezones.js file)
    timezones.forEach(tz => {
      const option = document.createElement('option');
      option.value = tz;
      timezoneDatalist.appendChild(option);
    });
  }

  // Show add form
  function showAddForm() {
    document.getElementById('addForm').style.display = 'block';
    document.getElementById('addButton').style.display = 'none';

    // Clear form fields
    document.getElementById('name').value = '';
    document.getElementById('timezone').value = '';
    document.getElementById('label').value = '';
  }

  // Hide add form
  function hideAddForm() {
    document.getElementById('addForm').style.display = 'none';
    document.getElementById('addButton').style.display = 'block';
  }

  // Save new time zone
  function saveNewTimeZone() {
    const name = document.getElementById('name').value;
    const timezone = document.getElementById('timezone').value;
    const label = document.getElementById('label').value;
    
    // Use 'auto' as bgColor 
    const bgColor = getRandomPaletteColor();
    const textColor = 'auto';

    if (!name || !timezone || !label) {
      alert('Please fill in all fields');
      return;
    }

    // Get current time zones
    const timeZones = window.currentTimeZones || [];

    // Add new time zone
    timeZones.push({
      name: name,
      timezone: timezone,
      label: label,
      bgColor: bgColor,
      textColor: textColor
    });

    // Save to storage
    saveTimeZones(timeZones);

    // Hide form
    hideAddForm();
  }

  // Edit time zone
  function editTimeZone(index) {
    const timeZones = window.currentTimeZones || [];
    const zone = timeZones[index];
  
    if (!zone) {
      alert('Time zone not found');
      return;
    }
  
    // Show form with current values
    document.getElementById('addForm').style.display = 'block';
    document.getElementById('addButton').style.display = 'none';
  
    document.getElementById('name').value = zone.name;
    document.getElementById('timezone').value = zone.timezone;
    document.getElementById('label').value = zone.label;
    
    // Change save button to update this time zone
    const saveButton = document.getElementById('saveButton');
    saveButton.textContent = 'Update';

    // Remove save event from button
    saveButton.removeEventListener('click', saveNewTimeZone);
  
    // Create a completely new handler for the update
    saveButton.addEventListener('click', function() {
      console.log("C");
      const name = document.getElementById('name').value;
      const timezone = document.getElementById('timezone').value;
      const label = document.getElementById('label').value;
      const bgColor = zone.bgColor;
      const textColor = zone.textColor;
  
      if (!name || !timezone || !label) {
        alert('Please fill in all fields');
        return;
      }
  
      // Update time zone
      timeZones[index] = {
        name: name,
        timezone: timezone,
        label: label,
        bgColor: bgColor,
        textColor: textColor
      };
  
      // Save to storage
      saveTimeZones(timeZones);
  
      // Hide form
      hideAddForm();
  
      // Reset the button for future use
      saveButton.textContent = 'Save';
      
      // IMPORTANT: Replace the handler with the original saveNewTimeZone function
      saveButton.addEventListener('click', saveNewTimeZone);
    });

  }

  // Delete time zone
  function deleteTimeZone(index) {
    if (!confirm('Are you sure you want to delete this time zone?')) {
      return;
    }

    const timeZones = window.currentTimeZones || [];

    // Remove time zone
    timeZones.splice(index, 1);

    // Save to storage
    saveTimeZones(timeZones);
  }

  //saveTimeZones function to include sorting
  function saveTimeZones(timeZones) {
    // Sort the time zones by GMT offset
    const sortedTimeZones = sortTimeZonesByOffset(timeZones);

    // Check if Chrome storage API is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        // Use Chrome storage
        chrome.storage.sync.set({ timeZones: sortedTimeZones }, function() {
            // Reload options
            loadOptions(sortedTimeZones);
        });
    } else {
        // Store in window variable as fallback
        console.log('Chrome storage API not available. Storing in memory only.');
        window.currentTimeZones = sortedTimeZones;
        loadOptions(sortedTimeZones);
    }
  }
    
});