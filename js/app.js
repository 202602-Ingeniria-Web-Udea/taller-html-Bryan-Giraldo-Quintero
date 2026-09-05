/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

const API_URL = "https://pokeapi.co/api/v2/pokemon";

const POKEMON_PER_PAGE = 20;

const SEARCH_DEBOUNCE_TIME = 350;


/* =========================================================
   TRADUCCIÓN DE TIPOS POKÉMON
   ========================================================= */

const TYPE_TRANSLATIONS = {
    normal: "Normal",
    fire: "Fuego",
    water: "Agua",
    electric: "Eléctrico",
    grass: "Planta",
    ice: "Hielo",
    fighting: "Lucha",
    poison: "Veneno",
    ground: "Tierra",
    flying: "Volador",
    psychic: "Psíquico",
    bug: "Bicho",
    rock: "Roca",
    ghost: "Fantasma",
    dragon: "Dragón",
    dark: "Siniestro",
    steel: "Acero",
    fairy: "Hada"
};

/* =========================================================
   TRADUCCIÓN DE ESTADÍSTICAS
   ========================================================= */

const STAT_TRANSLATIONS = {
    hp: "PS",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "At. Especial",
    "special-defense": "Def. Especial",
    speed: "Velocidad"
};

/* =========================================================
   ESTADO DE LA APLICACIÓN
   ========================================================= */

/*
    Lista completa de Pokémon proporcionada por PokéAPI.
    Contiene principalmente nombre y URL.
*/
let allPokemon = [];


/*
    Lista actualmente filtrada.

    Cuando no hay búsqueda:
    filteredPokemon === allPokemon

    Cuando el usuario busca:
    contiene únicamente las coincidencias.
*/
let filteredPokemon = [];


/*
    Estado de paginación.
*/
let currentPage = 1;

let totalPokemon = 0;

let totalPages = 1;


/*
    Temporizador utilizado para el debounce.
*/
let searchTimeout = null;

/* =========================================================
   ESTADO DE MI EQUIPO
   ========================================================= */

const MAX_TEAM_SIZE = 6;

const TEAM_STORAGE_KEY = "poketeam";


/*
    Guardamos únicamente los IDs en localStorage. Los detalles completos se recuperan cuando sea necesario.
*/
let teamIds = [];

/* =========================================================
   REFERENCIAS A ELEMENTOS DEL HTML
   ========================================================= */

const pokemonGrid =
    document.getElementById("pokemonGrid");

const loadingMessage =
    document.getElementById("loadingMessage");

const loadingText =
    document.getElementById("loadingText");

const errorMessage =
    document.getElementById("errorMessage");

const errorText =
    document.getElementById("errorText");

const retryButton =
    document.getElementById("retryButton");

const errorTitle =
    document.getElementById("errorTitle");

const emptyMessage =
    document.getElementById("emptyMessage");

const resultsCounter =
    document.getElementById("resultsCounter");

const searchInput =
    document.getElementById("searchInput");

const clearSearchButton =
    document.getElementById("clearSearchButton");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const pageIndicator =
    document.getElementById("pageIndicator");

const teamButton =
    document.getElementById("teamButton");

const teamCounter =
    document.getElementById("teamCounter");

const teamSection =
    document.getElementById("teamSection");

const teamOverlay =
    document.getElementById("teamOverlay");

const closeTeamButton =
    document.getElementById("closeTeamButton");

const teamGrid =
    document.getElementById("teamGrid");

const emptyTeamMessage =
    document.getElementById("emptyTeamMessage");

const teamDescription =
    document.getElementById("teamDescription");

const pokemonModal =
    document.getElementById("pokemonModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalBody =
    document.getElementById("modalBody");

const closeModalButton =
    document.getElementById("closeModalButton");

/* =========================================================
   OBTENER LISTA COMPLETA DE POKÉMON
   ========================================================= */

/**
 * Obtiene la lista completa de Pokémon.
 *
 * Solamente necesitamos nombre y URL en esta petición.
 * Los detalles se consultarán posteriormente para los
 * Pokémon que realmente vamos a mostrar.
 *
 * @returns {Promise<Object>} Respuesta de PokéAPI.
 */
async function fetchAllPokemon() {

    const response = await fetch(
        `${API_URL}?limit=10000&offset=0`
    );

    if (!response.ok) {

        throw new Error(
            `Error HTTP: ${response.status}`
        );
    }

    return await response.json();
}


/* =========================================================
   OBTENER DETALLES DE POKÉMON
   ========================================================= */

/**
 * Obtiene la información completa de un Pokémon.
 *
 * @param {string} url - URL individual de PokéAPI.
 * @returns {Promise<Object>} Detalles del Pokémon.
 */
async function fetchPokemonDetails(url) {

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Error HTTP: ${response.status}`
        );
    }

    return await response.json();
}


/* =========================================================
   OBTENER DETALLES DE UNA PÁGINA
   ========================================================= */

/**
 * Obtiene los detalles de los Pokémon que pertenecen
 * a la página actualmente seleccionada.
 *
 * @param {Array} pokemonList - Lista de Pokémon a consultar.
 * @returns {Promise<Array>} Detalles completos.
 */
async function fetchPokemonDetailsForPage(pokemonList) {

    return await Promise.all(
        pokemonList.map(
            pokemon => fetchPokemonDetails(pokemon.url)
        )
    );
}


/* =========================================================
   CREAR TARJETA DE POKÉMON
   ========================================================= */

/**
 * Crea el elemento HTML correspondiente a un Pokémon.
 *
 * @param {Object} pokemon - Información completa.
 * @returns {HTMLElement} Tarjeta creada.
 */
function createPokemonCard(pokemon) {

    const card = document.createElement("article");

    card.className = "pokemon-card";


    /*
        Formato del número:
        1   → 001
        25  → 025
        150 → 150
    */
    const pokemonNumber = String(pokemon.id)
        .padStart(3, "0");
        
    const isInTeam =
    teamIds.includes(pokemon.id);

    const teamIsFull = teamIds.length >= MAX_TEAM_SIZE;

    let teamButtonText = "+ Mi Equipo";

    if (isInTeam) {
        teamButtonText = "✓ En mi equipo";
    } 
    
    else if (teamIsFull) {teamButtonText = "Equipo lleno";
        
    }

    /*
        Generamos las etiquetas de tipo.
    */
    const typeBadges = pokemon.types
        .map(typeData => {

            const type = typeData.type.name;

            const translatedType =
                TYPE_TRANSLATIONS[type] ||
                capitalize(type);

            return `
                <span class="type-badge type-badge--${type}">
                    ${translatedType}
                </span>
            `;
        })
        .join("");


    card.innerHTML = `
        <div class="pokemon-card__image-container">

            <img
                src="${pokemon.sprites.front_default}"
                alt="Imagen de ${capitalize(pokemon.name)}"
                class="pokemon-card__image"
                loading="lazy"
            >

        </div>

        <div class="pokemon-card__body">

            <span class="pokemon-card__number">
                #${pokemonNumber}
            </span>

            <h3 class="pokemon-card__name">
                ${capitalize(pokemon.name)}
            </h3>

            <div class="pokemon-card__types">
                ${typeBadges}
            </div>

            <div class="pokemon-card__actions">

                <button
                    type="button"
                    class="pokemon-card__button pokemon-card__button--details"
                    data-pokemon-id="${pokemon.id}"
                >
                    Detalles
                </button>

                <button
                    type="button"
                    class="pokemon-card__button pokemon-card__button--team"
                    data-pokemon-id="${pokemon.id}"
                    ${teamIsFull && !isInTeam ? "disabled" : ""}
                >
                    ${teamButtonText}
                </button>

            </div>

        </div>
    `;

    return card;
}

/* =========================================================
   CREAR ESTADÍSTICAS DEL POKÉMON
   ========================================================= */

/**
 * Genera el HTML de las estadísticas de un Pokémon.
 *
 * @param {Array} stats - Estadísticas proporcionadas por PokéAPI.
 * @returns {string} HTML de las estadísticas.
 */
function createStatsHTML(stats) {

    return stats.map(statData => {

        const statName =
            statData.stat.name;

        const translatedName =
            STAT_TRANSLATIONS[statName] ||
            capitalize(statName);


        const statValue =
            statData.base_stat;


        /*
            Utilizamos 150 como referencia visual.
            Algunas estadísticas pueden superar 100.
        */
        const percentage =
            Math.min(
                (statValue / 150) * 100,
                100
            );


        return `
            <div class="stat-row">

                <div class="stat-row__header">

                    <span class="stat-row__name">
                        ${translatedName}
                    </span>

                    <span class="stat-row__value">
                        ${statValue}
                    </span>

                </div>

                <div class="stat-row__bar">

                    <div
                        class="stat-row__progress"
                        style="width: ${percentage}%"
                    ></div>

                </div>

            </div>
        `;

    }).join("");
}

/* =========================================================
   MOSTRAR DETALLES DE UN POKÉMON
   ========================================================= */

/**
 * Construye y muestra el modal de detalles.
 *
 * @param {Object} pokemon - Pokémon del que se mostrarán detalles.
 */
function openPokemonModal(pokemon) {

    const pokemonNumber =
        String(pokemon.id)
            .padStart(3, "0");


    const typeBadges =
        pokemon.types
            .map(typeData => {

                const type =
                    typeData.type.name;

                const translatedType =
                    TYPE_TRANSLATIONS[type] ||
                    capitalize(type);

                return `
                    <span class="type-badge type-badge--${type}">
                        ${translatedType}
                    </span>
                `;
            })
            .join("");


    const statsHTML =
        createStatsHTML(
            pokemon.stats
        );


    /*
        PokéAPI entrega altura y peso
        en decímetros y hectogramos.
    */
    const height =
        (pokemon.height / 10)
            .toFixed(1);


    const weight =
        (pokemon.weight / 10)
            .toFixed(1);


    modalBody.innerHTML = `
        <div class="pokemon-detail">

            <div class="pokemon-detail__image-container">

                <img
                    src="${pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default}"
                    alt="Imagen de ${capitalize(pokemon.name)}"
                    class="pokemon-detail__image"
                >

            </div>


            <div class="pokemon-detail__content">

                <span class="pokemon-detail__number">
                    #${pokemonNumber}
                </span>

                <h2
                    id="modalPokemonName"
                    class="pokemon-detail__name"
                >
                    ${capitalize(pokemon.name)}
                </h2>


                <div class="pokemon-detail__types">
                    ${typeBadges}
                </div>


                <div class="pokemon-detail__physical">

                    <div class="physical-data">

                        <span class="physical-data__label">
                            Altura
                        </span>

                        <strong>
                            ${height} m
                        </strong>

                    </div>


                    <div class="physical-data">

                        <span class="physical-data__label">
                            Peso
                        </span>

                        <strong>
                            ${weight} kg
                        </strong>

                    </div>

                </div>


                <div class="pokemon-detail__stats">

                    <h3>
                        Estadísticas base
                    </h3>

                    <div class="stats-list">
                        ${statsHTML}
                    </div>

                </div>

            </div>

        </div>
    `;


    pokemonModal.classList.remove("hidden");

    document.body.style.overflow = "hidden";
}

/* =========================================================
   CERRAR MODAL
   ========================================================= */

function closePokemonModal() {

    pokemonModal.classList.add("hidden");

    document.body.style.overflow = "";
}


closeModalButton.addEventListener(
    "click",
    closePokemonModal
);


modalOverlay.addEventListener(
    "click",
    closePokemonModal
);

/* =========================================================
   CREAR TARJETA DE MI EQUIPO
   ========================================================= */

/**
 * Crea una tarjeta para un Pokémon perteneciente
 * a Mi Equipo.
 *
 * @param {Object} pokemon - Información completa.
 * @returns {HTMLElement} Tarjeta creada.
 */
function createTeamCard(pokemon) {

    const card =
        document.createElement("article");

    card.className = "team-card";


    const pokemonNumber =
        String(pokemon.id)
            .padStart(3, "0");


    const typeBadges =
        pokemon.types
            .map(typeData => {

                const type =
                    typeData.type.name;

                const translatedType =
                    TYPE_TRANSLATIONS[type] ||
                    capitalize(type);

                return `
                    <span class="type-badge type-badge--${type}">
                        ${translatedType}
                    </span>
                `;
            })
            .join("");


    card.innerHTML = `
        <img
            src="${pokemon.sprites.front_default}"
            alt="Imagen de ${capitalize(pokemon.name)}"
            class="team-card__image"
        >

        <span class="team-card__number">
            #${pokemonNumber}
        </span>

        <h3 class="team-card__name">
            ${capitalize(pokemon.name)}
        </h3>

        <div class="team-card__types">
            ${typeBadges}
        </div>

        <button
            type="button"
            class="team-card__remove"
            data-remove-pokemon-id="${pokemon.id}"
        >
            🗑 Eliminar
        </button>
    `;


    return card;
}

/* =========================================================
   MOSTRAR MI EQUIPO
   ========================================================= */

/**
 * Obtiene y muestra los Pokémon pertenecientes
 * al equipo.
 */
async function renderTeam() {

    teamGrid.innerHTML = "";


    /*
        Equipo vacío.
    */
    if (teamIds.length === 0) {

        emptyTeamMessage.classList.remove(
            "hidden"
        );

        teamDescription.textContent =
            "Tu equipo puede tener hasta 6 Pokémon.";

        return;
    }


    emptyTeamMessage.classList.add(
        "hidden"
    );


    teamDescription.textContent =
        `${teamIds.length} de ${MAX_TEAM_SIZE} Pokémon seleccionados.`;


    try {

        const teamPokemon =
            await Promise.all(
                teamIds.map(id =>
                    fetchPokemonDetails(
                        `${API_URL}/${id}`
                    )
                )
            );


        const fragment =
            document.createDocumentFragment();


        teamPokemon.forEach(pokemon => {

            const card =
                createTeamCard(pokemon);

            fragment.appendChild(card);
        });


        teamGrid.appendChild(fragment);

    } catch (error) {

        console.error(
            "Error al cargar Mi Equipo:",
            error
        );

        teamDescription.textContent =
            "No fue posible cargar los Pokémon del equipo.";
    }
}

/* =========================================================
   ABRIR Y CERRAR MI EQUIPO
   ========================================================= */

function openTeam() {

    teamSection.classList.remove("hidden");

    teamOverlay.classList.remove("hidden");

    renderTeam();
}


function closeTeam() {

    teamSection.classList.add("hidden");

    teamOverlay.classList.add("hidden");
}

teamButton.addEventListener(
    "click",
    openTeam
);


closeTeamButton.addEventListener(
    "click",
    closeTeam
);


teamOverlay.addEventListener(
    "click",
    closeTeam
);

/* =========================================================
   EVENTOS DE MI EQUIPO
   ========================================================= */

pokemonGrid.addEventListener(
    "click",
    async event => {

        /*
            Comprobamos primero si se pulsó
            el botón de detalles.
        */
        const detailsButton =
            event.target.closest(
                ".pokemon-card__button--details"
            );


        if (detailsButton) {

            const pokemonId =
                Number(
                    detailsButton.dataset.pokemonId
                );


            try {

                detailsButton.disabled = true;

                detailsButton.textContent =
                    "Cargando...";


                const pokemon =
                    await fetchPokemonDetails(
                        `${API_URL}/${pokemonId}`
                    );


                openPokemonModal(pokemon);


            } catch (error) {

                console.error(
                    "Error al cargar detalles:",
                    error
                );

            } finally {

                detailsButton.disabled = false;

                detailsButton.textContent =
                    "Detalles";
            }


            return;
        }


        /*
            Si no fue detalles, comprobamos
            el botón de Mi Equipo.
        */
        const teamButton =
            event.target.closest(
                ".pokemon-card__button--team"
            );


        if (!teamButton) {
            return;
        }


        const pokemonId =
            Number(
                teamButton.dataset.pokemonId
            );


        if (teamIds.includes(pokemonId)) {

            removeFromTeam(pokemonId);

            return;
        }


        addToTeam(pokemonId);
    }
);

teamGrid.addEventListener(
    "click",
    event => {

        const removeButton =
            event.target.closest(
                ".team-card__remove"
            );


        if (!removeButton) {
            return;
        }


        const pokemonId =
            Number(
                removeButton.dataset.removePokemonId
            );


        removeFromTeam(pokemonId);
    }
);

/* =========================================================
   CAPITALIZAR TEXTO
   ========================================================= */

/**
 * Convierte la primera letra de un texto a mayúscula.
 *
 * @param {string} text - Texto original.
 * @returns {string} Texto modificado.
 */
function capitalize(text) {

    return text.charAt(0).toUpperCase() +
        text.slice(1);
}

/* =========================================================
   LOCALSTORAGE — MI EQUIPO
   ========================================================= */

/**
 * Recupera el equipo guardado en el navegador.
 */
function loadTeamFromStorage() {

    try {

        const savedTeam =
            localStorage.getItem(
                TEAM_STORAGE_KEY
            );


        if (!savedTeam) {

            teamIds = [];

            return;
        }


        const parsedTeam =
            JSON.parse(savedTeam);


        /*
            Nos aseguramos de que solamente
            existan como máximo 6 IDs.
        */
        if (Array.isArray(parsedTeam)) {

            teamIds = parsedTeam
                .slice(0, MAX_TEAM_SIZE);
        } else {

            teamIds = [];
        }

    } catch (error) {

        console.error(
            "Error al cargar Mi Equipo:",
            error
        );

        teamIds = [];
    }
}


/**
 * Guarda los IDs actuales del equipo.
 */
function saveTeamToStorage() {

    localStorage.setItem(
        TEAM_STORAGE_KEY,
        JSON.stringify(teamIds)
    );
}

/* =========================================================
   ACTUALIZAR CONTADOR DE MI EQUIPO
   ========================================================= */

/**
 * Actualiza el contador del encabezado.
 */
function updateTeamCounter() {

    teamCounter.textContent =
        `${teamIds.length}/${MAX_TEAM_SIZE}`;
}

/* =========================================================
   AGREGAR POKÉMON AL EQUIPO
   ========================================================= */

/**
 * Agrega un Pokémon al equipo.
 *
 * @param {number} pokemonId - ID del Pokémon.
 * @returns {boolean} Indica si se agregó correctamente.
 */
function addToTeam(pokemonId) {

    /*
        Evitamos duplicados.
    */
    if (teamIds.includes(pokemonId)) {

        return false;
    }


    /*
        Verificamos el límite máximo.
    */
    if (teamIds.length >= MAX_TEAM_SIZE) {

        alert(
            "Tu equipo ya está completo. Solo puedes tener 6 Pokémon."
        );

        return false;
    }


    /*
        Agregamos el Pokémon.
    */
    teamIds.push(pokemonId);


    /*
        Guardamos inmediatamente.
    */
    saveTeamToStorage();


    /*
        Actualizamos la interfaz.
    */
    updateTeamCounter();

    updatePokemonCardButtons();

    renderTeam();


    return true;
}

/* =========================================================
   ELIMINAR POKÉMON DEL EQUIPO
   ========================================================= */

/**
 * Elimina un Pokémon del equipo.
 *
 * @param {number} pokemonId - ID del Pokémon.
 */
function removeFromTeam(pokemonId) {

    teamIds =
        teamIds.filter(
            id => id !== pokemonId
        );


    saveTeamToStorage();

    updateTeamCounter();

    updatePokemonCardButtons();

    renderTeam();
}

/* =========================================================
   ACTUALIZAR BOTONES DE LAS TARJETAS
   ========================================================= */

/**
 * Actualiza el estado visual de los botones
 * que pertenecen a las tarjetas actualmente visibles.
 */
function updatePokemonCardButtons() {

    const teamButtons =
        document.querySelectorAll(
            ".pokemon-card__button--team"
        );


    teamButtons.forEach(button => {

        const pokemonId =
            Number(button.dataset.pokemonId);


        const isInTeam =
            teamIds.includes(pokemonId);


        if (isInTeam) {

            button.textContent =
                "✓ En mi equipo";

            button.disabled = false;

        } else if (
            teamIds.length >= MAX_TEAM_SIZE
        ) {

            button.textContent =
                "Equipo lleno";

            button.disabled = true;

        } else {

            button.textContent =
                "+ Mi Equipo";

            button.disabled = false;
        }
    });
}

/* =========================================================
   NORMALIZAR TEXTO PARA LA BÚSQUEDA
   ========================================================= */

/**
 * Normaliza un texto para facilitar las comparaciones.
 *
 * Convierte a minúsculas y elimina acentos.
 *
 * @param {string} text - Texto a normalizar.
 * @returns {string} Texto normalizado.
 */
function normalizeText(text) {

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


/* =========================================================
   MOSTRAR POKÉMON
   ========================================================= */

/**
 * Renderiza una lista de Pokémon en el grid.
 *
 * @param {Array} pokemonList - Pokémon que serán mostrados.
 */
function renderPokemon(pokemonList) {

    pokemonGrid.innerHTML = "";

    const fragment =
        document.createDocumentFragment();


    pokemonList.forEach(pokemon => {

        const card =
            createPokemonCard(pokemon);

        fragment.appendChild(card);
    });


    pokemonGrid.appendChild(fragment);

    updatePokemonCardButtons();
}


/* =========================================================
   ACTUALIZAR PAGINACIÓN
   ========================================================= */

/**
 * Actualiza el indicador y los botones
 * de navegación.
 */
function updatePagination() {

    pageIndicator.textContent =
        `Página ${currentPage} de ${totalPages}`;


    previousButton.disabled =
        currentPage === 1;


    nextButton.disabled =
        currentPage === totalPages;
}


/* =========================================================
   MOSTRAR MENSAJE DE RESULTADOS
   ========================================================= */

/**
 * Actualiza el contador que aparece encima
 * de las tarjetas.
 */
function updateResultsCounter() {

    if (searchInput.value.trim() === "") {

        resultsCounter.textContent =
            `${allPokemon.length.toLocaleString()} Pokémon disponibles`;

        return;
    }


    resultsCounter.textContent =
        `${filteredPokemon.length.toLocaleString()} coincidencias encontradas`;
}


/* =========================================================
   OBTENER LA PÁGINA ACTUAL
   ========================================================= */

/**
 * Obtiene solamente los 20 Pokémon correspondientes
 * a la página actual.
 *
 * @returns {Array} Pokémon de la página actual.
 */
function getCurrentPagePokemon() {

    const startIndex =
        (currentPage - 1) *
        POKEMON_PER_PAGE;


    const endIndex =
        startIndex +
        POKEMON_PER_PAGE;


    return filteredPokemon.slice(
        startIndex,
        endIndex
    );
}

/* =========================================================
   CARGAR PÁGINA
   ========================================================= */

/**
 * Carga los Pokémon correspondientes a la página actual.
 */
async function loadCurrentPage(loadingMessageText = "Estamos preparando tus resultados.") {

    try {

        loadingMessage.classList.remove("hidden");

        loadingText.textContent = loadingMessageText;

        errorMessage.classList.add("hidden");

        emptyMessage.classList.add("hidden");

        pokemonGrid.innerHTML = "";


        /*
            Obtenemos los máximo 20 Pokémon
            pertenecientes a esta página.
        */
        const currentPagePokemon =
            getCurrentPagePokemon();


        /*
            Si no existen resultados.
        */
        if (currentPagePokemon.length === 0) {

            loadingMessage.classList.add("hidden");

            emptyMessage.classList.remove("hidden");

            updatePagination();

            return;
        }


        /*
            Consultamos los detalles completos.
        */
        const pokemonDetails =
            await fetchPokemonDetailsForPage(
                currentPagePokemon
            );


        /*
            Mostramos las tarjetas.
        */
        renderPokemon(pokemonDetails);


        /*
            Actualizamos elementos de la interfaz.
        */
        updateResultsCounter();

        updatePagination();


        /*
            Ocultamos loading.
        */
        loadingMessage.classList.add("hidden");


    } catch (error) {

        console.error(
            "Error al cargar Pokémon:",
            error
        );

        loadingMessage.classList.add("hidden");

        errorMessage.classList.remove("hidden");

        errorText.textContent =
            "No fue posible cargar los Pokémon. Intenta nuevamente.";
    }
}


/* =========================================================
   BUSCAR POKÉMON
   ========================================================= */

/**
 * Filtra la lista completa de Pokémon usando
 * el texto introducido por el usuario.
 *
 * @param {string} searchTerm - Texto de búsqueda.
 */
function searchPokemon(searchTerm) {

    const normalizedSearch =
        normalizeText(searchTerm.trim());


    /*
        Si el campo está vacío, mostramos todos.
    */
    if (normalizedSearch === "") {

        filteredPokemon = allPokemon;

    } else {

        filteredPokemon =
            allPokemon.filter(pokemon => {

                const normalizedName =
                    normalizeText(pokemon.name);

                return normalizedName.includes(
                    normalizedSearch
                );
            });
    }


    /*
        Cada nueva búsqueda comienza
        nuevamente desde la página 1.
    */
    currentPage = 1;

    totalPokemon =
        filteredPokemon.length;

    totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredPokemon.length /
                POKEMON_PER_PAGE
            )
        );


    updateResultsCounter();

    updatePagination();

    loadCurrentPage(
    normalizedSearch === ""
        ? "Estamos cargando los Pokémon."
        : "Estamos preparando los resultados de tu búsqueda."
);
}


/* =========================================================
   DEBOUNCE DE LA BÚSQUEDA
   ========================================================= */

/**
 * Retrasa la búsqueda hasta que el usuario
 * deje de escribir durante el tiempo definido.
 *
 * @param {string} searchTerm - Texto introducido.
 */
function handleSearchWithDebounce(searchTerm) {

    /*
        Cancelamos el temporizador anterior.
    */
    clearTimeout(searchTimeout);


    /*
        Creamos un nuevo temporizador.
    */
    searchTimeout = setTimeout(() => {

        searchPokemon(searchTerm);

    }, SEARCH_DEBOUNCE_TIME);
}


/* =========================================================
   EVENTO DEL INPUT DE BÚSQUEDA
   ========================================================= */

searchInput.addEventListener(
    "input",
    event => {

        const searchTerm =
            event.target.value;

        handleSearchWithDebounce(
            searchTerm
        );
    }
);


/* =========================================================
   LIMPIAR BÚSQUEDA
   ========================================================= */

clearSearchButton.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        searchPokemon("");

        searchInput.focus();
    }
);


/* =========================================================
   EVENTOS DE PAGINACIÓN
   ========================================================= */

previousButton.addEventListener(
    "click",
    () => {

        if (currentPage > 1) {

            currentPage--;

            loadCurrentPage("Estamos cargando la siguiente página");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }
);


nextButton.addEventListener(
    "click",
    () => {

        if (currentPage < totalPages) {

            currentPage++;

            loadCurrentPage();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }
);

/* =========================================================
   REINTENTAR CARGA
   ========================================================= */

retryButton.addEventListener(
    "click",
    async () => {

        /*
            Ocultamos temporalmente el error.
        */
        errorMessage.classList.add("hidden");

        /*
            Volvemos a cargar la información.
        */
        await initializeApp();
    }
);

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

/**
 * Inicializa la aplicación.
 */
async function initializeApp() {

    loadTeamFromStorage();

    updateTeamCounter();

    try {

        loadingMessage.classList.remove("hidden");

        errorMessage.classList.add("hidden");

        /*
            Obtenemos la lista completa solamente una vez.
        */
        const data =
            await fetchAllPokemon();


        allPokemon = data.results;

        filteredPokemon = allPokemon;


        totalPokemon =
            allPokemon.length;

        totalPages =
            Math.ceil(
                allPokemon.length /
                POKEMON_PER_PAGE
            );


        /*
            Mostramos la primera página.
        */
        await loadCurrentPage();


    } catch (error) {

        console.error(
            "Error al inicializar la aplicación:",
            error
        );

        loadingMessage.classList.add("hidden");

        errorMessage.classList.remove("hidden");

        errorText.textContent =
            "No fue posible conectar con PokéAPI. Intenta nuevamente.";
    }
}


/* =========================================================
   INICIAR APLICACIÓN
   ========================================================= */

initializeApp();