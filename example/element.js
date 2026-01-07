import '../src/x-snc-gmap';
import '../src/x-snc-gmap-demo'
import './styles.css';

// Remove default browser margin on body
document.body.style.margin = '0';
document.body.style.padding = '0';

const el = document.createElement('DIV');
el.style.width = '100%';
document.body.appendChild(el);

el.innerHTML =`<x-snc-gmap-demo></x-snc-gmap-demo>`;

// Add CSS file
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = './styles.css';
document.head.appendChild(link);