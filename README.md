# 📍 Find My Class (NaviU)

> Sistema de navegación web e itinerarios interactivos mobile-first para campus universitarios.

![NodeJS](https://img.shields.io/badge/Node.js-v18-green?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express.js-v4-black?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15-blue?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## 📌 Descripción

**Find My Class (NaviU)** es una solución móvil diseñada para optimizar el desplazamiento de estudiantes, colaboradores y visitantes dentro del campus universitario UAG. Permite ubicar aulas, laboratorios, áreas administrativas y puntos de interés mediante un flujo intuitivo, rápido y adaptado a dispositivos móviles.

Actualmente, el proyecto ha comenzado de forma oficial el desarrollo de la **Versión 1.0 (MVP)**, centrada en la maquetación, arquitectura y lógica del **Módulo de Autenticación y Registro Mobile-First**.

---

## 👥 Metodología y Desarrollo

Para acelerar el prototipado y la validación en caliente de componentes, el equipo ha trabajado bajo esquemas de **Pair Programming (Programación en Pareja)**. Esto ha permitido realizar iteraciones en tiempo real para:
- Pruebas directas de red local desde dispositivos móviles a través de Hotspot/Bypass de restricciones de red.
- Sincronización continua de lógica de interfaz y reglas de negocio entre Frontend y Backend.
- Maquetación colaborativa con diseño responsivo basado en estética *pill-input* y componentes dinámicos.

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js (REST API)
* **Base de Datos:** PostgreSQL (Dockerizado)
* **Frontend:** HTML5, CSS3 Mobile-First, Vanilla JavaScript (ES6+), Lucide Icons
* **Infraestructura:** Docker & Docker Compose
* **Herramientas:** WebStorm, Git/GitHub, Postman

---

## 📁 Arquitectura del Monorepositorio

```text
Find-My-Class/
├── backend/            # API REST (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── config/     # Conexión a BD
│   │   └── app.js      # Servidor API
│   ├── Dockerfile
│   └── package.json
│
├── frontend/           # Interfaz de usuario Mobile-First (v1.0 MVP)
│   ├── assets/         # Logotipos y recursos gráficos
│   ├── css/            # Hoja de estilos unificada (styles.css)
│   ├── js/             # Scripts de validación y navegación (app.js, registro.js, etc.)
│   ├── index.html      # Selección de Rol
│   ├── register.html   # Registro de usuario (Flujo unificado + validación en vivo)
│   ├── verify.html     # Verificación por código institucional
│   ├── login.html      # Inicio de sesión
│   └── forgot-password.html # Recuperación de contraseña
│
├── docs/               # Diagramas de secuencia, wireframes y manuales
├── docker-compose.yml  # Orquestador de contenedores
└── README.md

📱 Inicio Rápido (Desarrollo y Pruebas en Móvil)
Prerrequisitos
Docker Desktop instalado y ejecutándose.

Git.

Pasos para levantar el entorno
Clonar el repositorio:

Bash
git clone [https://github.com/MATTHEWW21/Find-My-Class.git](https://github.com/MATTHEWW21/Find-My-Class.git)
cd Find-My-Class
Levantar los contenedores:

Bash
docker-compose up --build -d
Prueba desde tu teléfono móvil (Red Local):

Conecta tu laptop al Hotspot de tu celular o a la red local.

Obtén tu IP IPv4 mediante ipconfig (Windows) o ifconfig (macOS/Linux).

Desde el navegador de tu celular, ingresa a:

Plaintext
http://TU_IP_LOCAL:3000
🗺️ Roadmap de Desarrollo (Versión 0.9 (TEST))
[x] Semana 1-5: Configuración de entorno con Docker, Express, PostgreSQL y diseño inicial de BD.

🗺️ Roadmap de Desarrollo (Versión 1.0)

[x] Semana 6-7 (Pair Programming & Sprint Autenticación v1.0):

[x] Selección dinámica de roles (ESTUDIANTE, COLABORADOR UAG, VISITANTE).

[x] Formulario de registro unificado con validación estricta de contraseñas en tiempo real (mínimo 8 caracteres, mayúscula, número y especial).

[x] Pantalla de verificación de 6 dígitos con correo simulado.

[x] Login estilizado e integración con la pantalla de recuperación de contraseña.

[ ] Semana 8-9: Conexión de endpoints de autenticación con PostgreSQL para persistencia de datos y sesiones.

[ ] Semana 10-11: Integración del mapa interactivo con Leaflet/OpenStreetMap y trazado de rutas en campus.

[ ] Semana 12: Pruebas finales de integración, optimización y entrega.

✒️ Autor
Erick García - Software Engineering Student - @MATTHEWW21