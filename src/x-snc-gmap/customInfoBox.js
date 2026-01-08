/**
 * Custom InfoBox Overlay
 * A simple, fully customizable info popup that replaces Google's InfoWindow
 * Based on Google Maps OverlayView for complete DOM control
 */

import { convertSnakeCaseToTitleCase } from "./stringUtils";

let currentOpenInfoBox = null;

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

export function createCustomInfoBox(title, obj, position, map) {
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

  const html = buildInfoBoxContent(title, obj);
  const infoBox = new CustomInfoBox(position, html);
  infoBox.setMap(map);
  currentOpenInfoBox = infoBox;

  return infoBox;
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
