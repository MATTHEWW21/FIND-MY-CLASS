// Referencias UI a la Tarjeta de Edificio
const buildingCard = document.getElementById('buildingCard');
const cardTitle = document.getElementById('cardTitle');
const cardDescription = document.getElementById('cardDescription');
const closeCardBtn = document.getElementById('closeCardBtn');

// Función global para mostrar la tarjeta con los datos del edificio
function showBuildingCard(data) {
    cardTitle.textContent = data.nombre;
    cardDescription.textContent = data.descripcion || 'Edificio/Aula del campus';
    buildingCard.classList.remove('hidden');
}

// Evento para cerrar la tarjeta
closeCardBtn.addEventListener('click', () => {
    buildingCard.classList.add('hidden');
});