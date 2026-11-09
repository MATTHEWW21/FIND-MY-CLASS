(function () {
    const CLAVE = 'fmc_ui_grande';
    function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
    function aplicar(on) {
        document.documentElement.classList.toggle('ui-grande', !!on);
    }
    function activar(on) {
        try { localStorage.setItem(CLAVE, on ? '1' : '0'); } catch (e) {  }
        aplicar(on);
    }
    const href = (document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/js\/ui-grande\.js.*$/, '') : '') + 'css/ui-grande.css';
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
    aplicar(leer() === '1');
    window.FMCUIGrande = { activo: () => document.documentElement.classList.contains('ui-grande'), activar, definido: () => leer() !== null };
})();
