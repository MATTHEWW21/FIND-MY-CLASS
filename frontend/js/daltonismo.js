(function () {
    const CLAVE = 'fmc_daltonismo';
    function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
    function aplicar(on) { document.documentElement.classList.toggle('daltonismo', !!on); }
    function activar(on) {
        try { localStorage.setItem(CLAVE, on ? '1' : '0'); } catch (e) {  }
        aplicar(on);
        window.dispatchEvent(new CustomEvent('fmc:daltonismo', { detail: { activo: !!on } }));
    }
    const href = (document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/js\/daltonismo\.js.*$/, '') : '') + 'css/daltonismo.css';
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
    aplicar(leer() === '1');
    const RUTA = { normal: '#1a1a1a', escaleras: '#E69F00', rampa: '#0072B2' };
    window.FMCDaltonismo = { activo: () => document.documentElement.classList.contains('daltonismo'), activar, RUTA };
})();
