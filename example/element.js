import '../src/x-snc-google-map'

const el = document.createElement('DIV');
document.body.appendChild(el);

el.innerHTML = `
    <div style="height: 500px; width: 350px;">
        <x-snc-google-map></x-snc-google-map>
    </div>`;