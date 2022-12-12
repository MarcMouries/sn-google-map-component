import '../src/x-snc-googlemap';

const el = document.createElement('DIV');
document.body.appendChild(el);

el.innerHTML = `
<x-snc-googlemap data=[{table: "task", sys_id: "ac26c34c1be37010b93654a2604bcbd5", lat: 38.913014, long: -77.224186, image: "https://pbs.twimg.com/profile_images/1483341411911041025/hY5z-EDB_400x400.jpg"}]></x-snc-googlemap>
`;