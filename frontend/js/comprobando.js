try { if (localStorage.getItem('token') && localStorage.getItem('userRole') !== 'visitante') document.documentElement.classList.add('comprobando'); } catch (e) {}
