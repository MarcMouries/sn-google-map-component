import '../src/x-snc-gmap';
import '../src/x-snc-gmap-demo'

const el = document.createElement('DIV');
document.body.appendChild(el);

el.innerHTML =`
<div id="example-container"
       style='width: 800px; height: 800px;'>
       <x-snc-gmap-demo></x-snc-gmap-demo>
</div>`;



/*
mapMarkers=[{table: \"task\", sys_id: \"ac26c34c1be37010b93654a2604bcbd5\", lat: 38.913014, long: -77.224186, image: \"https://pbs.twimg.com/profile_images/1483341411911041025/hY5z-EDB_400x400.jpg\"}]
 */
//const markerFields = ["name", "city", "state"];

/*

const el = document.createElement('DIV');
document.body.appendChild(el);

el.innerHTML =`
<div id="example-container"
       style='width: 800px; height: 800px;'>
       <x-snc-gmap
              center-on="PLACE"
              initial-zoom=10
              language="en"
              place="ServiceNow, Leesburg Pike, Vienna, VA"
              map-markers-fields=${markerFields}>
              map-markers-fields="${markerFields.join(',')}">

       </x-snc-gmap>
</div>`;
 */
/* 
const el = document.createElement('DIV');
document.body.appendChild(el);


const exampleContainer = document.createElement('div');
exampleContainer.id = "example-container";
exampleContainer.style.width = "800px";
exampleContainer.style.height = "800px";

const xSncGmap = document.createElement('x-snc-gmap');
xSncGmap.setAttribute('center-on', 'PLACE');
xSncGmap.setAttribute('initial-zoom', '10');
xSncGmap.setAttribute('language', 'en');
xSncGmap.setAttribute('place', 'ServiceNow, Leesburg Pike, Vienna, VA');
xSncGmap.setAttribute('map-markers-fields', markerFields);

exampleContainer.appendChild(xSncGmap);
el.appendChild(exampleContainer);
*/



