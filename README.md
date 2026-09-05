# ⚡ PokéTeam

Aplicación web interactiva desarrollada con **HTML, CSS y JavaScript**, cuyo propósito es consultar, explorar y buscar información de Pokémon utilizando la API pública **PokéAPI**.

La aplicación permite visualizar Pokémon de forma paginada, realizar búsquedas dinámicas y crear un equipo personalizado de hasta seis Pokémon, inspirado en la mecánica de los juegos y la serie Pokémon.

---

## 📌 Descripción del proyecto

**PokéTeam** es una mini aplicación web desarrollada como proyecto académico para el curso de **Ingeniería Web**.

El proyecto utiliza una API pública para obtener información de Pokémon y presenta los datos mediante una interfaz gráfica responsive y orientada a la interacción del usuario.

Los usuarios pueden:

* Explorar los Pokémon disponibles.
* Visualizar 20 Pokémon por página.
* Navegar entre diferentes páginas.
* Buscar Pokémon automáticamente mientras escriben.
* Utilizar búsqueda con `debounce`.
* Consultar información detallada de cada Pokémon.
* Crear un equipo personalizado de hasta 6 Pokémon.
* Eliminar Pokémon del equipo.
* Mantener el equipo almacenado aunque se recargue la página.
* Utilizar la aplicación desde computador, tablet o dispositivo móvil.

---

## 🎯 Objetivo

Aplicar de manera práctica conocimientos de:

* HTML.
* CSS.
* JavaScript.
* Consumo de APIs REST.
* Programación asíncrona.
* Manipulación dinámica del DOM.
* Manejo de eventos.
* Diseño responsive.
* Persistencia de información utilizando `localStorage`.

---

## 🚀 Funcionalidades

### 🔎 Búsqueda dinámica

La aplicación permite buscar Pokémon mediante el nombre.

La búsqueda se ejecuta automáticamente mientras el usuario escribe y utiliza una técnica de **debounce de 350 milisegundos** para evitar ejecutar la búsqueda innecesariamente ante cada tecla presionada.

La búsqueda no distingue entre mayúsculas y minúsculas.

Ejemplo:

```text
char
```

puede encontrar:

```text
Charmander
Charmeleon
Charizard
```

---

### 📄 Paginación

Los Pokémon se muestran en páginas de máximo **20 elementos**.

La navegación dispone de:

* Página anterior.
* Página siguiente.
* Indicador de página actual.
* Deshabilitación automática de botones cuando no existe una página anterior o siguiente.

La paginación se combina con el sistema de búsqueda, por lo que los resultados encontrados también pueden distribuirse en varias páginas.

---

### 🃏 Tarjetas de Pokémon

Cada Pokémon se presenta mediante una tarjeta que incluye:

* Imagen.
* Número de Pokédex.
* Nombre.
* Tipo o tipos de Pokémon.
* Botón para consultar detalles.
* Botón para añadirlo a Mi Equipo.

Los tipos proporcionados por PokéAPI se muestran traducidos al español.

---

### 📖 Detalles del Pokémon

Cada tarjeta incluye un botón **Detalles** que abre una ventana con información adicional:

* Imagen oficial.
* Número de Pokédex.
* Nombre.
* Tipo o tipos.
* Altura.
* Peso.
* Estadísticas base.
* Representación visual de las estadísticas.

El modal puede cerrarse mediante el botón `X` o haciendo clic sobre el fondo.

---

### ⚡ Mi Equipo

La aplicación incluye una funcionalidad llamada **Mi Equipo**, inspirada en la posibilidad de formar un equipo Pokémon.

Características:

* Máximo de 6 Pokémon.
* No se permiten Pokémon duplicados.
* Los Pokémon pueden eliminarse del equipo.
* El contador muestra la cantidad actual:

```text
Mi Equipo 4/6
```

* Al alcanzar seis Pokémon, no se permite agregar un séptimo.
* Los Pokémon seleccionados mantienen su estado aunque se cambie de página o se realice una búsqueda.

---

### 💾 Persistencia con localStorage

Los Pokémon pertenecientes a Mi Equipo se almacenan utilizando `localStorage`.

La aplicación guarda los identificadores de los Pokémon seleccionados y los recupera cuando el usuario vuelve a cargar la página.

Esto permite mantener el equipo después de cerrar o actualizar el navegador.

---

### ⚠️ Manejo de errores

La aplicación contempla errores relacionados con el consumo de la API y la conexión.

Cuando ocurre un problema se muestra un mensaje informativo y un botón:

```text
↻ Reintentar
```

Esto permite volver a realizar la solicitud sin necesidad de recargar manualmente toda la página.

---

### ⏳ Estados de carga

Mientras la aplicación consulta información desde PokéAPI se muestra un indicador de carga.

El mensaje se adapta según la operación realizada, por ejemplo:

```text
Cargando Pokémon...

Estamos preparando los resultados de tu búsqueda.
```

---

## 🛠️ Tecnologías utilizadas

El proyecto fue desarrollado exclusivamente utilizando tecnologías web nativas.

| Tecnología   | Uso                              |
| ------------ | -------------------------------- |
| HTML5        | Estructura de la aplicación      |
| CSS3         | Diseño, estilos y responsive     |
| JavaScript   | Lógica, eventos y consumo de API |
| Fetch API    | Solicitudes HTTP                 |
| PokéAPI      | Fuente de información            |
| localStorage | Persistencia de Mi Equipo        |

### 🚫 Frameworks

No se utilizaron frameworks ni librerías externas.

El proyecto fue desarrollado únicamente con:

```text
HTML
CSS
JavaScript
```

---

## 🌐 API utilizada

La aplicación utiliza **PokéAPI**, una API pública REST que proporciona información relacionada con Pokémon.

URL principal:

```text
https://pokeapi.co/api/v2/pokemon
```

La aplicación utiliza los endpoints de Pokémon para obtener:

* Nombre.
* Identificador.
* Imagen.
* Tipos.
* Altura.
* Peso.
* Estadísticas.

Para las listas paginadas se utilizan parámetros como:

```text
limit
offset
```

Ejemplo:

```text
https://pokeapi.co/api/v2/pokemon?limit=20&offset=0
```

---

## 🧠 Funcionamiento de la búsqueda

La aplicación carga inicialmente la lista disponible de Pokémon y mantiene en memoria los nombres y URLs necesarios para realizar el filtrado.

Cuando el usuario escribe en el buscador:

```text
Input
  ↓
Debounce 350 ms
  ↓
Normalización del texto
  ↓
Filtrado de Pokémon
  ↓
Cálculo de paginación
  ↓
Consulta de detalles de los Pokémon visibles
  ↓
Renderizado de las tarjetas
```

De esta manera se evita realizar una nueva búsqueda HTTP por cada carácter introducido.

---

## 📊 Funcionamiento de la paginación

La aplicación utiliza un tamaño fijo de:

```text
20 Pokémon por página
```

La página se calcula mediante:

```javascript
offset = (currentPage - 1) * POKEMON_PER_PAGE;
```

Por ejemplo:

```text
Página 1 → offset = 0
Página 2 → offset = 20
Página 3 → offset = 40
```

Cuando existe una búsqueda activa, la paginación se calcula sobre los resultados filtrados.

---

## 🗂️ Estructura del proyecto

```text
taller-html-nombre-apellidos/
│
├── index.html
│
├── css/
│   └── styles.css
│
├── js/
│   └── app.js
│
└── README.md
```

### `index.html`

Contiene la estructura principal de la aplicación:

* Header.
* Buscador.
* Listado de Pokémon.
* Paginación.
* Mi Equipo.
* Modal de detalles.
* Mensajes de carga y error.

### `css/styles.css`

Contiene:

* Variables visuales.
* Estilos generales.
* Diseño de tarjetas.
* Botones.
* Tipos de Pokémon.
* Modal.
* Mi Equipo.
* Estados de carga.
* Responsive design.

### `js/app.js`

Contiene la lógica principal:

* Consumo de PokéAPI.
* Procesamiento de respuestas.
* Renderizado dinámico.
* Búsqueda.
* Debounce.
* Paginación.
* Modal.
* Mi Equipo.
* localStorage.
* Manejo de errores.

---

## 📱 Diseño responsive

La interfaz se adapta a diferentes tamaños de pantalla.

### Escritorio

```text
4 Pokémon por fila
```

### Tablet

```text
3 Pokémon por fila
```

### Móvil

```text
2 Pokémon por fila
```

### Móvil pequeño

```text
1 Pokémon por fila
```

La cantidad de Pokémon por página continúa siendo como máximo:

```text
20 Pokémon
```

independientemente del tamaño de la pantalla.

---

## ▶️ Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone 202602-Ingenieria-Web-Udea/taller-html-Bryan-Giraldo-Quintero
```

### 2. Acceder al proyecto

```bash
cd taller-html-Bryan-Giraldo-Quintero
```

### 3. Abrir el proyecto en Visual Studio Code

```bash
code .
```

### 4. Ejecutar la aplicación

El proyecto no requiere instalación de dependencias.

Puede ejecutarse utilizando un servidor local desde Visual Studio Code, por ejemplo mediante una extensión como **Live Server**, o mediante cualquier servidor HTTP local.

Una vez iniciado el servidor, abrir la dirección indicada por el entorno, por ejemplo:

```text
http://127.0.0.1:5500/
```
---

## 👨‍💻 Autor

**Nombre:** Bryan Giraldo Quintero

**Curso:** Ingeniería Web

**Proyecto:** Taller HTML, CSS y JavaScript

---

## 📚 Créditos

Información de Pokémon proporcionada por:

**PokéAPI**

```text
https://pokeapi.co/
```

Este proyecto fue desarrollado con fines académicos.

