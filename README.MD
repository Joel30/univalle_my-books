# MyBooks

MyBooks es una aplicación móvil desarrollada en **React Native + Expo** que permite a los usuarios gestionar y reseñar libros. La aplicación proporciona una experiencia completa para explorar libros, mantener una biblioteca personal y compartir opiniones sobre sus lecturas.

## Características Principales

- **Autenticación con Firebase**: Registro e inicio de sesión mediante email y contraseña.
- **Integración con la API de Udacity Books**: Obtención, by búsqueda de información de libros.
- **Gestor de Biblioteca Personal**: Secciones organizadas en:
  - **Librería**: Exploración de libros disponibles.
  - **Mis Libros**: Libros agregados por el usuario.
  - **Perfil**: Información y configuración del usuario.
- **Sistema de Reseñas**: Permite a los usuarios calificar y comentar sobre los libros.
- **Firebase Firestore**: Almacenamiento seguro de datos del usuario, libros y reseñas.

## Tecnologías Utilizadas

- **Frontend**: React Native + Expo o Flutter
- **Backend**: Firebase Authentication & Firestore
- **API**: Udacity Books API

## Instalación y Configuración

### Requisitos Previos
1. Tener instalado [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/).
2. Tener instalado [Expo CLI](https://docs.expo.dev/get-started/installation/).
3. Tener instaldo un emulador de dispositivo Android
3. Tener instalado Firebase CLI

### Instalación
1. Clona este repositorio:
   ```bash
   git clone https://github.com/Joel30/univalle_mi-comida-favorita.git
   cd my-books
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura Firebase:
   - Tener instalado Firebase CLI
      ```bash
      npm install -g firebase-tools
      ```
   - Login en Firebase
      ```bash
      firebase login
      ```
   - Modificar el archivo `firebase.js` en la carpeta `config/` con tu configuración de Firebase:
     ```javascript
     const firebaseConfig = {
       apiKey: "TU_API_KEY",
       authDomain: "TU_AUTH_DOMAIN",
       projectId: "TU_PROJECT_ID",
       storageBucket: "TU_STORAGE_BUCKET",
       messagingSenderId: "TU_MESSAGING_SENDER_ID",
       appId: "TU_APP_ID",
     };
     ```
   - Modificar `.firebaserc` de acuerdo a tu proyecto de Firebase
4. Inicia emuladores de Firebase:
   ```bash
   cd firebaseEmulator
   firebase emulators:start
   ```
5. Inicia la aplicación:
   ```bash
   cd my-books
   npm start
   ```
5. Ejecuta la aplicación en tu emulador de Android

