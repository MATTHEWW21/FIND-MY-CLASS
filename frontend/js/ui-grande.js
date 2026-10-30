// ui-grande.js - modo "Botones grandes": agranda botones, chips y controles para quien usa lector de pantalla (TalkBack) o toca con dificultad.
// Una pagina web no puede saber si TalkBack esta prendido, asi que es un ajuste que la persona activa (Perfil > Ajustes).
(function () {
    const CLAVE = 'fmc_ui_grande';
    function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
    function aplicar(on) {
        document.documentElement.classList.toggle('ui-grande', !!on);
    }
    function activar(on) {
        try { localStorage.setItem(CLAVE, on ? '1' : '0'); } catch (e) { /* sin almacenamiento: solo vale en esta pagina */ }
        aplicar(on);
    }
    const href = (document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/js\/ui-grande\.js.*$/, '') : '') + 'css/ui-grande.css';
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
    aplicar(leer() === '1');
    window.FMCUIGrande = { activo: () => document.documentElement.classList.contains('ui-grande'), activar, definido: () => leer() !== null };
})();
