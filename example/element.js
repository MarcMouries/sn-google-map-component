import '../src/x-snc-googlemap';

const el = document.createElement('DIV');
document.body.appendChild(el);

el.innerHTML = `
<x-snc-googlemap data="[{"my-data: "dummy"}]]"></x-snc-googlemap>
`;
