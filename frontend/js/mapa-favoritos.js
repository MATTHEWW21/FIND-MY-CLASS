(function () {
    function clave() {
        let quien = '';
        try { quien = localStorage.getItem('userEmail') || localStorage.getItem('userRole') || ''; } catch (e) {  }
        return 'fmc_favoritos:' + (quien || 'visitante');
    }

    function lista() {
        try {
            const v = JSON.parse(localStorage.getItem(clave()) || '[]');
            return Array.isArray(v) ? v : [];
        } catch (e) {
            return [];
        }
    }

    function guardar(v) {
        try { localStorage.setItem(clave(), JSON.stringify(v)); } catch (e) {  }
        document.dispatchEvent(new CustomEvent('fmc:favoritos', { detail: { lista: v.slice() } }));
    }

    function es(id) {
        return !!id && lista().includes(id);
    }

    function alternar(id) {
        if (!id) return false;
        const v = lista();
        const i = v.indexOf(id);
        if (i >= 0) v.splice(i, 1);
        else v.push(id);
        guardar(v);
        return i < 0;
    }

    window.FMCFavoritos = { lista, es, alternar };
})();
