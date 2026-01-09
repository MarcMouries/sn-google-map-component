/**
 * Custom InfoBox Overlay
 * A simple, fully customizable info popup that replaces Google's InfoWindow
 * Based on Google Maps OverlayView for complete DOM control
 *
 * Supports custom HTML templates with {{field}} placeholders:
 * - {{fieldName}} - replaced with the field value
 * - {{fieldName:format}} - applies formatting (number, date, currency)
 */

import { convertSnakeCaseToTitleCase } from "./stringUtils";

let currentOpenInfoBox = null;

/**
 * Process a template string by replacing {{field}} placeholders with values
 * Supports formatters: {{field:number}}, {{field:date}}, {{field:currency}}
 * @param {string} template - HTML template with {{field}} placeholders
 * @param {object} data - Object containing field values
 * @returns {string} - Processed HTML
 */
function processTemplate(template, data) {
  return template.replace(/\{\{(\w+)(?::(\w+))?\}\}/g, (match, field, formatter) => {
    let value = data[field];

    if (value === undefined || value === null) {
      return '';
    }

    // Apply formatter if specified
    if (formatter) {
      switch (formatter.toLowerCase()) {
        case 'number':
          value = formatNumber(value);
          break;
        case 'date':
          value = formatDate(value);
          break;
        case 'currency':
          value = typeof value === 'number' ? `$${formatNumber(value)}` : value;
          break;
        case 'uppercase':
          value = String(value).toUpperCase();
          break;
        case 'lowercase':
          value = String(value).toLowerCase();
          break;
      }
    }

    return value;
  });
}

/**
 * Format a date string to a more readable format
 * Input: "2025-07-09" -> Output: "Jul 9, 2025"
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateString;
  }
}

/**
 * Format number with commas for thousands
 * Input: 39000 -> Output: "39,000"
 */
function formatNumber(num) {
  if (num === undefined || num === null) return '';
  return num.toLocaleString();
}

/**
 * Create and display a custom info box on the map
 * @param {string} title - The title/header for the info box
 * @param {object} obj - Object containing field data to display
 * @param {google.maps.LatLng} position - Position to display the info box
 * @param {google.maps.Map} map - The Google Map instance
 * @param {string} [template] - Optional custom HTML template with {{field}} placeholders
 */
export function createCustomInfoBox(title, obj, position, map, template) {
  // Close any existing open info box
  if (currentOpenInfoBox) {
    currentOpenInfoBox.setMap(null);
  }

  class CustomInfoBox extends google.maps.OverlayView {
    constructor(position, content) {
      super();
      this.position = position;
      this.content = content;
      this.div = null;
    }

    onAdd() {
      this.div = document.createElement('div');
      this.div.className = 'custom-info-box';
      this.div.innerHTML = this.content;

      // Add close button handler
      const closeBtn = this.div.querySelector('.info-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.setMap(null);
          currentOpenInfoBox = null;
        });
      }

      // Close on click outside
      this.div.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      const panes = this.getPanes();
      panes.floatPane.appendChild(this.div);
    }

    draw() {
      const overlayProjection = this.getProjection();
      const pos = overlayProjection.fromLatLngToDivPixel(this.position);

      if (this.div) {
        // Position above the marker, centered horizontally
        this.div.style.left = (pos.x - 140) + 'px'; // Half of min-width
        this.div.style.top = (pos.y - this.div.offsetHeight - 40) + 'px';
      }
    }

    onRemove() {
      if (this.div) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }
  }

  // Use custom template if provided, otherwise use default styled layout
  const html = template
    ? buildTemplateContent(title, obj, template)
    : buildInfoBoxContent(title, obj);
  const infoBox = new CustomInfoBox(position, html);
  infoBox.setMap(map);
  currentOpenInfoBox = infoBox;

  return infoBox;
}

/**
 * Build info box content from a custom template
 * Wraps the processed template in the standard container with close button
 */
function buildTemplateContent(title, obj, template) {
  // Merge title into the data object so it can be used in templates as {{name}}
  const data = { name: title, ...obj };
  const processedContent = processTemplate(template, data);

  return `
    <div class="info-box-container">
      <button class="info-close-btn">&times;</button>
      ${processedContent}
    </div>`;
}

function buildInfoBoxContent(title, obj) {
  let html = `
    <div class="info-box-container">
      <button class="info-close-btn">&times;</button>
      <div class="info-box-header">${title}</div>
      <div class="info-box-body">`;

  // Headline (if exists)
  if (obj.headline) {
    html += `<div class="info-box-headline">${obj.headline}</div>`;
  }

  // Stats row for cases/deaths
  if (obj.cases !== undefined || obj.deaths !== undefined) {
    html += `<div class="info-box-stats">`;
    if (obj.cases !== undefined) {
      html += `<div class="info-box-stat">
        <div class="stat-value">${formatNumber(obj.cases)}</div>
        <div class="stat-label">Cases</div>
      </div>`;
    }
    if (obj.deaths !== undefined) {
      html += `<div class="info-box-stat">
        <div class="stat-value">${formatNumber(obj.deaths)}</div>
        <div class="stat-label">Deaths</div>
      </div>`;
    }
    html += `</div>`;
  }

  // Other fields
  const skipFields = ['name', 'headline', 'cases', 'deaths', 'date_reported', 'date_ended', 'markerColor', 'position'];

  for (const prop in obj) {
    if (obj.hasOwnProperty(prop) && !skipFields.includes(prop)) {
      const propertyTitle = convertSnakeCaseToTitleCase(prop);
      let propertyValue = obj[prop];

      // Special handling for status field
      if (prop === 'status') {
        const statusClass = propertyValue === 'Active' ? 'status-active' : 'status-ended';
        propertyValue = `<span class="info-box-status ${statusClass}">${propertyValue}</span>`;
      }

      html += `<div class="info-box-field">
        <span class="field-label">${propertyTitle}:</span> ${propertyValue}
      </div>`;
    }
  }

  // Date at bottom
  if (obj.date_reported) {
    html += `<div class="info-box-date">Reported: ${formatDate(obj.date_reported)}`;
    if (obj.date_ended) {
      html += ` &bull; Ended: ${formatDate(obj.date_ended)}`;
    }
    html += `</div>`;
  }

  html += `</div></div>`;

  return html;
}

/**
 * Close the currently open info box
 */
export function closeCurrentInfoBox() {
  if (currentOpenInfoBox) {
    currentOpenInfoBox.setMap(null);
    currentOpenInfoBox = null;
  }
}
