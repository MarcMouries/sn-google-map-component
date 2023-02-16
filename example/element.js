import '../src/x-snc-gmap';

const el = document.createElement('DIV');
document.body.appendChild(el);

el.innerHTML =`
<div id="example-container"
       style='width: 800px; height: 800px;'>
       <x-snc-gmap
              center-on="PLACE"
              initial-zoom=20
              language="ja"
              place="ServiceNow, Leesburg Pike, Vienna, VA">
       </x-snc-gmap>
</div>`;

/*
mapMarkers=[{table: \"task\", sys_id: \"ac26c34c1be37010b93654a2604bcbd5\", lat: 38.913014, long: -77.224186, image: \"https://pbs.twimg.com/profile_images/1483341411911041025/hY5z-EDB_400x400.jpg\"}]
 */