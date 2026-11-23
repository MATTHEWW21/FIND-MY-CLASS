(function () {
    const CLAVE = 'fmc_oscuro';
    const TEMA_CLARO = '#6B1E33';
    const TEMA_OSCURO = '#141414';
    function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
    function aplicar(on) {
        document.documentElement.classList.toggle('modo-oscuro', !!on);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', on ? TEMA_OSCURO : TEMA_CLARO);
    }
    function activar(on) {
        try { localStorage.setItem(CLAVE, on ? '1' : '0'); } catch (e) {  }
        aplicar(on);
        window.dispatchEvent(new CustomEvent('fmc:oscuro', { detail: { activo: !!on } }));
    }
    const href = (document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/js\/oscuro\.js.*$/, '') : '') + 'css/oscuro.css';
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
    aplicar(leer() === '1');
    document.addEventListener('DOMContentLoaded', () => aplicar(leer() === '1'));
    window.FMCOscuro = { activo: () => document.documentElement.classList.contains('modo-oscuro'), activar };
})();
