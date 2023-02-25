/**
 * We encapsulated the custom class RadiusOverlay, which extends the google.maps.Overlay, within a factory function
 * to resolve a build error that can occur when constructing the project. The error may state "google is not defined"
 * due to Webpack's inability to recognize "google" during build time since the Google Maps JavaScript API is not
 * loaded at build time, the Overlay class cannot be evaluated at the module level.
 * By using a factory function to wrap the class, we are able to address this build error.
 * @param {*} container 
 * @param {*} pane 
 * @param {*} position 
 * @returns 
 */
export function createRadiusOverlay(
    container  /* : HTMLElement */,
    pane       /* : keyof google.maps.MapPanes */,
    position   /* : google.maps.LatLng | google.maps.LatLngLiteral */
  ) {

  /**
   * Custom overlay for Google Maps JavaScript API v3 that allows users to add
   * additional graphical content to the map beyond what is provided by default.
   */
    class RadiusOverlay extends google.maps.OverlayView {
      position = null;
      content = null;

      constructor(position, content) {
        super(position, content);
        position && (this.position = position);
        content && (this.content = content);
      }

      onAdd = () => {
        this.getPanes().floatPane.appendChild(this.content);
      };

      onRemove = () => {
        if (this.content.parentElement) {
          this.content.parentElement.removeChild(this.content);
        }
      };
      draw = () => {
        const projection = this.getProjection();
        const point = projection.fromLatLngToDivPixel(this.position);
        const { offsetWidth, offsetHeight } = this.content;
        // center the content on the specified position
        const x = point.x - offsetWidth / 2;
        const y = point.y - offsetHeight / 2 - offsetHeight;

        this.content.style.transform = `translate(${x}px, ${y}px)`;
      };

      // changes the node element
      setContent = (newContent) => {
        if (this.content.parentElement) {
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

    return new RadiusOverlay(container, pane, position)
  }