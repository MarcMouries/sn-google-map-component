import '../src/x-snc-gmap';
import '../src/x-snc-gmap-demo'
import './styles.css'; 

const el = document.createElement('DIV');
document.body.appendChild(el);

el.innerHTML =`
<div id="example-container"
       style='width: 800px; height: 800px;'>
       <x-snc-gmap-demo></x-snc-gmap-demo>
</div>`;

// Add CSS file
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = './styles.css';
document.head.appendChild(link);