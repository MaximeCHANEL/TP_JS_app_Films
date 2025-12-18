// Variables pour la page courante et le terme de recherche actuel
let currentPage = 1;
let currentSearch = " ";

// Récupération de l'id de l'input
const film = document.getElementById('search_film');
// Récupération de l'id du bouton
const bouton = document.getElementById('search_button');

// Fonction pour créer la pagination
function createPagination(totalResults) {
    // Récupération de la div pagination
    const pagination = document.querySelector(".pagination");
    // Réinitialisation du contenu de la pagination
    pagination.innerHTML = "";

    // Calcul du nombre total de pages
    const totalPages = Math.ceil(totalResults / 10);

    // Création des boutons de pagination pour plus de 1 page
    if (currentPage > 1) {
        // Création du bouton précédent
        const prev = document.createElement("button");
        // Nommage du bouton
        prev.textContent = "Précédent";
        // Ajout de l'événement onclick pour aller à la page précédente
        prev.onclick = () => main(currentPage - 1);
        // Ajout du bouton dans la div pagination
        pagination.appendChild(prev);
    }

    // Création des boutons de pagination pour première page et autres pages inferieur à totalPages
    if (currentPage < totalPages) {
        // Création du bouton suivant
        const next = document.createElement("button");
        // Nommage du bouton
        next.textContent = "Suivant";
        // Ajout de l'événement onclick pour aller à la page suivante
        next.onclick = () => main(currentPage + 1);
        // Ajout du bouton dans la div pagination
        pagination.appendChild(next);
    }
}

// Fonction pour récupérer les données depuis l'api OMDB
async function fetchFilmData(film, page) {
    // appel à l'api avec la clé API
    const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(film)}&apikey=6a1d442&page=${page}`);
    // conversion de la réponse en JSON
    const data = await response.json();
    // retour des données
    return data;
}

// Fonction pour récupérer les détails d'un film par son ID
async function fetchFilmById(imdbID) {
    // appel à l'api avec la clé API
    const response = await fetch(
        `https://www.omdbapi.com/?i=${imdbID}&plot=short&apikey=6a1d442`
    );
    // retour des données en JSON
    return await response.json();
}

// Fonction principale pour afficher les films
async function main(page = 1) {
    // Récupération du nom du film depuis l'input
    const filmName = film.value.trim();
    // Si le champ est vide, on ne fait rien
    if (!filmName) return;

    // Mise à jour de la variable de recherche par le nom du film
    currentSearch = filmName;
    // Mise à jour de la page courante
    currentPage = page;

    // Récupération des données des films en fonction de la page
    const filmData = await fetchFilmData(filmName, page);
    // Récupération de la liste des films
    const movies = filmData.Search;

    // Récupération de la div container pour afficher les cartes
    const container = document.querySelector(".cards-container");
    // Réinitialisation du contenu de la div container
    container.innerHTML = "";

    // Si aucun film n'est trouvé, afficher un message
    if (!movies) {
        // Affichage du message dans le container
        container.innerHTML = `<p class="not_result">Aucun film trouvé.</p>`;
        return;
    }

    // Pour chaque film, création d'une carte
    movies.forEach(async (movie) => {

        // Gestion de l'affichage si l'affiche n'est pas disponible
        const poster = movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg";

        // Création de la carte
        const card = document.createElement("div");
        // Ajout d'une classe à la carte
        card.classList.add("card");

        // 🔹 Contenu de base (rapide)
        card.innerHTML = `
            <img src="${poster}" alt="${movie.Title}">
            <div class="card-content">
                <h2>${movie.Title}</h2>
                <span>${movie.Year}</span>
                <p class="plot">Chargement du résumé...</p>
            </div>
        `;

        // Ajout de la carte dans le container
        container.appendChild(card);

        // 🔥 Récupération automatique du Plot
        try {
            // Récupération des détails du film par son ID
            const details = await fetchFilmById(movie.imdbID);

            // Mise à jour du résumé dans la carte
            const plotElement = card.querySelector(".plot");
            // Vérification si le résumé est disponible
            plotElement.textContent = details.Plot !== "N/A"
                // Si disponible, affichage du résumé
                ? details.Plot
                // Sinon, message d'indisponibilité
                : "Résumé indisponible.";
        } catch (error) {
            // En cas d'erreur, affichage dans la console
            console.error("Erreur chargement détails :", error);
        }
    });

    // Création de la pagination en fonction du nombre total de résultats
    createPagination(filmData.totalResults);
}


// Ajouter un écouteur d'événement au bouton de recherche
bouton.addEventListener("click", () => {
    // Appel de la fonction principale avec la page 1
    main(1);
});