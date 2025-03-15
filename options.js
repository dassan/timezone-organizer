document.addEventListener('DOMContentLoaded', function() {
  // Default time zones in case nothing is stored yet
  const defaultTimeZones = [
    { name: 'Honolulu, HI, United States', timezone: 'Pacific/Honolulu', label: 'HNL', bgColor: '#e6ebd1', textColor: '#333333' },
    { name: 'Tokyo, Japan', timezone: 'Asia/Tokyo', label: 'TYO', bgColor: '#1c2d4e', textColor: '#ffffff' },
    { name: 'Auckland, New Zealand', timezone: 'Pacific/Auckland', label: 'AKL', bgColor: '#4ba3a9', textColor: '#ffffff' },
    { name: 'Anchorage, AL, United States', timezone: 'America/Anchorage', label: 'ANC', bgColor: '#c2e5c9', textColor: '#333333' },
    { name: 'Salt Lake City, UT, United States', timezone: 'America/Denver', label: 'SLC', bgColor: '#fcd153', textColor: '#333333' },
    { name: 'Georgetown, Guyana', timezone: 'America/Guyana', label: 'GEO', bgColor: '#f9a357', textColor: '#333333' },
    { name: 'London, United Kingdom', timezone: 'Europe/London', label: 'LON', bgColor: '#9a5a96', textColor: '#ffffff' },
    { name: 'Abu Dhabi, UAE', timezone: 'Asia/Dubai', label: 'AUH', bgColor: '#1c1656', textColor: '#ffffff' },
    { name: 'Kathmandu, Nepal', timezone: 'Asia/Kathmandu', label: 'KTM', bgColor: '#0a0c20', textColor: '#ffffff' },
    { name: 'Jakarta, Indonesia', timezone: 'Asia/Jakarta', label: 'JKT', bgColor: '#141c37', textColor: '#ffffff' }
  ];

  // Initialize storage with default or stored data
  initializeTimeZones();

  // Initialize UI elements
  document.getElementById('addButton').addEventListener('click', showAddForm);
  document.getElementById('cancelButton').addEventListener('click', hideAddForm);
  document.getElementById('saveButton').addEventListener('click', saveNewTimeZone);
  initializeColorPickers();


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

  // Load options with the provided time zones
  function loadOptions(timeZones) {
    const container = document.getElementById('timeZonesList');
    if (!container) {
      console.error('Time zones list container not found');
      return;
    }

    container.innerHTML = ''; // Clear existing content

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

  function initializeColorPickers() {
    const bgColorPicker = document.getElementById('bgColor');
    const textColorPicker = document.getElementById('textColor');
    const colorPreview = document.getElementById('colorPreview');
  
    if (bgColorPicker && textColorPicker && colorPreview) {
      // Update preview when colors change
      bgColorPicker.addEventListener('input', updateColorPreview);
      textColorPicker.addEventListener('input', updateColorPreview);
  
      // Set initial values
      bgColorPicker.value = '#4ba3a9';
      textColorPicker.value = '#ffffff';
      updateColorPreview();
    }
    
    // Populate the timezone datalist
    populateTimezoneDatalist();
  }

  // Update color preview
  function updateColorPreview() {
    const bgColor = document.getElementById('bgColor').value;
    const textColor = document.getElementById('textColor').value;
    const colorPreview = document.getElementById('colorPreview');
    const labelInput = document.getElementById('label');

    if (colorPreview && labelInput) {
      colorPreview.style.backgroundColor = bgColor;
      colorPreview.style.color = textColor;
      colorPreview.textContent = labelInput.value || 'ABC';
    }
  }

  // Show add form
  function showAddForm() {
    document.getElementById('addForm').style.display = 'block';
    document.getElementById('addButton').style.display = 'none';

    // Clear form fields
    document.getElementById('name').value = '';
    document.getElementById('timezone').value = '';
    document.getElementById('label').value = '';
    document.getElementById('bgColor').value = '#4ba3a9';
    document.getElementById('textColor').value = '#ffffff';
    updateColorPreview();
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
    const bgColor = document.getElementById('bgColor').value;
    const textColor = document.getElementById('textColor').value;

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
    document.getElementById('bgColor').value = zone.bgColor;
    document.getElementById('textColor').value = zone.textColor;
    updateColorPreview();

    // Change save button to update this time zone
    const saveButton = document.getElementById('saveButton');
    saveButton.textContent = 'Update';

    // Store original save function
    const originalSaveFunction = saveButton.onclick;

    // Set new function
    saveButton.onclick = function() {
      const name = document.getElementById('name').value;
      const timezone = document.getElementById('timezone').value;
      const label = document.getElementById('label').value;
      const bgColor = document.getElementById('bgColor').value;
      const textColor = document.getElementById('textColor').value;

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

      // Restore original save function
      saveButton.textContent = 'Save';
      saveButton.onclick = originalSaveFunction;
    };
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