document.addEventListener("DOMContentLoaded", () => {
    const newPostContainer = document.getElementById("new-post-container");
    const savedPost = localStorage.getItem("latestPost");

    if (savedPost && newPostContainer) {
        const post = JSON.parse(savedPost);

        const statsHTML = post.showStats ? `
            <div class="post-stats-row">
                <div class="p-stat">
                    <span class="lbl">Distancia</span>
                    <strong class="val">${post.dist}</strong>
                </div>
                <div class="p-stat">
                    <span class="lbl">Calorías</span>
                    <strong class="val">${post.cal}</strong>
                </div>
                <div class="p-stat">
                    <span class="lbl">Tiempo</span>
                    <strong class="val">${post.duration}</strong>
                </div>
            </div>
        ` : '';

        newPostContainer.innerHTML = `
            <article class="feed-card-post">
                <!-- User Header -->
                <div class="post-user-row">
                    <div class="user-avatar-info">
                        <img src="assets/avatar-angel.jpg" alt="Avatar" class="user-avatar">
                        <div>
                            <h4 class="user-name">${post.author}</h4>
                            <span class="post-time">👟 ${post.time}</span>
                        </div>
                    </div>
                    <div class="activity-badge-circle">🚶</div>
                </div>

                <!-- Título -->
                <h3 class="post-title-text">${post.activity.charAt(0) + post.activity.slice(1).toLowerCase()} en la tarde por la UAG</h3>

                <!-- Métricas opcionales -->
                ${statsHTML}

                <!-- Imagen Publicada -->
                <div class="post-image-wrapper">
                    <img src="${post.imgSrc}" alt="Imagen de la ruta" class="post-main-img">
                </div>

                <!-- Reacciones -->
                <div class="post-reactions-row">
                    <div class="likes-preview">
                        <span class="like-avatar-group">👥</span>
                        <span>Le gusta a ti y a 5 otros</span>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-like">🧡</button>
                        <button class="btn-comment">💬 <span>1</span></button>
                        <button class="btn-more">⋮</button>
                    </div>
                </div>

                <!-- Pie de Foto / Comentario -->
                <div class="post-caption-box">
                    <p>${post.caption}</p>
                </div>
            </article>
        `;
    }
});