# 📍 Find My Class

> Sistema de navegación web e itinerarios interactivos para campus universitarios.

![NodeJS](https://img.shields.io/badge/Node.js-v18-green?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express.js-v4-black?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15-blue?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## 📌 Descripción

**Find My Class** es una solución pensada para optimizar el desplazamiento de estudiantes y visitantes dentro del campus universitario. Permite ubicar aulas, laboratorios, áreas administrativas y puntos de interés mediante mapas interactivos, optimizando rutas de navegación paso a paso.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js (REST API)
* **Base de Datos:** PostgreSQL
* **Frontend:** HTML5, CSS3, JavaScript (Leaflet / OpenStreetMap)
* **Infraestructura:** Docker & Docker Compose
* **Herramientas:** WebStorm, Postman, Git/GitHub

---

## 📁 Arquitectura del Proyecto

El proyecto está estructurado como un **monorepositorio**:

```text
Find-My-Class/
├── backend/            # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/     # Conexión a Base de Datos
│   │   └── app.js      # Servidor principal
│   ├── Dockerfile
│   └── package.json
│
├── frontend/           # Interfaz de usuario (Próximamente)
│
├── docs/               # Documentación y diagramas
├── docker-compose.yml  # Orquestador de contenedores
└── README.md
🚀 Inicio Rápido (Desarrollo)
Prerrequisitos
Docker Desktop instalado y ejecutándose.

Git

Pasos para levantar el entorno
Clonar el repositorio:

Bash
git clone [https://github.com/MATTHEWW21/Find-My-Class.git](https://github.com/MATTHEWW21/Find-My-Class.git)
cd Find-My-Class
Levantar contenedores con Docker Compose:

Bash
docker-compose up --build
Verificar estado de la API:
Abre tu navegador o Postman en: http://localhost:3000/api/health

🗺️ Roadmap de Desarrollo
[x] Semana 3: Configuración del entorno base con Docker, Express y PostgreSQL.

[ ] Semana 4-5: Diseños de base de datos (Entidad-Relación) y migración de tablas.

[ ] Semana 6-8: Desarrollo de endpoints REST para aulas, rutas y categorías.

[ ] Semana 9-11: Integración de mapa interactivo con Leaflet/OpenStreetMap.

[ ] Semana 12: Pruebas finales, optimización y documentación.

✒️ Autor
Erick García - Software Engineer Student - MATTHEWW21
