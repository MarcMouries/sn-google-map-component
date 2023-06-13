export const Logger = {
    enabled: true,
    styling: `
        background-color:black;
        color:white;
        padding: 8px;
        font-family: Courier;
        font-size: 16px; 
        font-weight: 600;
    `,

    log(message, variable = null) {
        if (this.enabled) {
            if (variable !== null) {
                console.log(`%c${message}`, `${this.styling}`, variable);
            } else {
                console.log(`%c${message}`, `${this.styling}`);
            }
        }
    },
}
