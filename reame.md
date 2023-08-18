# blog Api

## Descripcion del proyecto

Este proyecto es una api de un blog, permitira a los usuarios registrarse, iniciar sesion, subir post, comentar post, ver post, se podra subir imagenes, ir al perfil de un usuario. La aplicacion esta contruida utilizando Nodejs, Express y utiliza como base de datos PostgreSQL para almacenar la informacion


## Funcionalidades principales
1. Crear post 
2. Subir imagenes
3. Registrar usuarios
4. loguearse con un usuario
5. Utiliza websockets para cuando se cree un post, se emita ese post creado a todos los clientes.
6. Comentar post
7. Eliminar post
8. Actualizar post

## Tecnologias utilizadas
1. Express: es un framework minimalista de aplicaciones web para Node.js. 
2. Express-rate-limit: es un middleware para el framework Express de Node.js que permite limitar la cantidad de solicitudes que un cliente puede realizar a una API en un período de tiempo determinado. 
3. Firebase: es una plataforma de desarrollo móvil y web desarrollada por Google. Proporciona una amplia gama de herramientas y servicios que permiten a los desarrolladores crear, mejorar y administrar aplicaciones de manera eficiente.
4. postgreSQL: es un sistema de gestión de bases de datos relacional (RDBMS) de código abierto y altamente potente. Se destaca por su enfoque en la conformidad con los estándares SQL y por ofrecer una amplia gama de características avanzadas. 
5. Sequelize:  es una biblioteca de Node.js que facilita la interacción con bases de datos relacionales, como MySQL, PostgreSQL, SQLite y MSSQL, mediante el uso de objetos y métodos en lugar de consultas SQL directas. 
6. JsonWebTokens: es un estándar abierto (RFC 7519) que define un método compacto y seguro para transmitir información entre dos partes en forma de objetos JSON. Se utiliza comúnmente para autenticar y autorizar solicitudes en aplicaciones web y APIs.
7. socket.io: es una biblioteca de JavaScript que permite la comunicación bidireccional en tiempo real entre el servidor y el cliente a través de la web. Proporciona una forma sencilla de crear aplicaciones en tiempo real que pueden enviar y recibir datos instantáneamente.

## Requisitos previos para utilizar el proyecto

1. Tener node instalado en el equipo
2. Tener instalado PostgreSQL
3. Tener creada una base de datos en PostgreSQL
4. Tener una isntalcion de firebase creadad con almacenamiento en firestore

## Como ejecutar el proyecto
1. Clonar el repositorio
2. Ejecutar npm install:
```
npm install
```
3. Crearse la base de datos local con postgreSQL
4. Crearse una app de firebase e inicializar firestore en ella.
5. clonar el .env.template y renombrerlo a .env
6. llenar las variables de entorno
7. levantar el modo de desarrollo utilizando el comando: 
```
npm run start:dev
```
