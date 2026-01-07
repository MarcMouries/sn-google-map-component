/**
 * We encapsulated the custom class RadiusOverlay, which extends the google.maps.Overlay, within a factory function
 * to resolve a build error that can occur when constructing the project. The error may state "google is not defined"
 * due to Webpack's inability to recognize "google" during build time since the Google Maps JavaScript API is not
 * loaded at build time, the Overlay class cannot be evaluated at the module level.
 * By using a factory function to wrap the class, we are able to address this build error.
 * @param {google.maps.LatLng | google.maps.LatLngLiteral} position - The position for the overlay
 * @param {HTMLElement} content - The HTML element to display as the overlay content
 * @returns {RadiusOverlay}
 */
export function createRadiusOverlay(position, content) {

  /**
   * Custom overlay for Google Maps JavaScript API v3 that allows users to add
   * additional graphical content to the map beyond what is provided by default.
   */
    class RadiusOverlay extends google.maps.OverlayView {
      position = null;
      content = null;

      constructor(position, content) {
        super();
        this.position = position || null;
        this.content = content || null;
      }

      onAdd = () => {
        const panes = this.getPanes();
        if (panes && panes.floatPane && this.content) {
          panes.floatPane.appendChild(this.content);
        }
      };

      onRemove = () => {
        if (this.content && this.content.parentElement) {
          this.content.parentElement.removeChild(this.content);
        }
      };

      draw = () => {
        const projection = this.getProjection();
        // Guard against projection not being ready yet
        if (!projection || !this.position || !this.content) {
          return;
        }
        const point = projection.fromLatLngToDivPixel(this.position);
        if (!point) {
          return;
        }
        const { offsetWidth } = this.content;
        // Center horizontally and position just below the bottom of the circle
        const x = point.x - offsetWidth / 2;
        const y = point.y + 5; // 5px below the bottom edge of the circle

        this.content.style.transform = `translate(${x}px, ${y}px)`;
      };

      // changes the node element
      setContent = (newContent) => {
        if (this.content && this.content.parentElement) {
          this.content.parentElement.removeChild(this.content);
        }
        this.content = newContent;
        this.onAdd();
      };

      // only changes the text
      setContentText = (newContentText) => {
        if (this.content) {
          this.content.textContent = newContentText;
          this.draw();
        }
      };

      setPosition(newPosition) {
        this.position = newPosition;
        this.draw();
      }
    }

    return new RadiusOverlay(position, content);
  }