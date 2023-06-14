import '../src/x-snc-gmap';
import '../src/x-snc-gmap-demo'

const el = document.createElement('DIV');
document.body.appendChild(el);

el.innerHTML =`
<div id="example-container"
       style='width: 800px; height: 800px;'>
       <x-snc-gmap-demo></x-snc-gmap-demo>
</div>`;