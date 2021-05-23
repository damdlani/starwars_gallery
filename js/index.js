{
  const SWAPI_URL = "http://swapi.dev/api";
  const IMAGES_API_URL = "https://akabab.github.io/starwars-api/api/all.json";

  let characters = {};
  let images = [];
  let films = [];
  let currentPage = 1;
  let darkTheme = false;
  const maxItemsPerPage = 10;

  const fetchData = async (directory) => {
    try {
      const response = await fetch(directory);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      renderStatus({
        loading: false,
        error: true,
      });
    }
  };

  const populateCharacters = async (page) => {
    console.log(page);
    renderStatus({
      loading: true,
      error: false,
    });

    const { count, next, previous, results } = await fetchData(
      page ? page : `${SWAPI_URL}/people/`
    );

    characters = {
      ...characters,
      count,
      next,
      previous,
      numberOfPages: Math.ceil(count / maxItemsPerPage),
      characters: results,
    };
    console.log(characters);
    renderStatus({
      loading: false,
      error: false,
    });

    renderCharacters();
    renderPagination();
  };

  const populateImages = async () => {
    const data = await fetchData(IMAGES_API_URL);

    images = data.map(({ name, image }) => {
      return { name, image };
    });
  };

  const populateFilms = async () => {
    const { results } = await fetchData(`${SWAPI_URL}/films/`);

    films = results.map(({ episode_id }) => {
      return episode_id;
    });
  };

  const findCharacterImage = (characterName) => {
    const image = images?.find(({ name: imageName }) => {
      return imageName.toLowerCase().includes(characterName.toLowerCase());
    });
    return image ? image.image : "";
  };

  const characterToHTML = ({ name }) => {
    const characterHTMLString = `
    <div class="gallery__item ${
      darkTheme ? "gallery__item--dark" : ""
    } js-showBioButton">

      <div class="item__image" style="background-image: url(${findCharacterImage(
        name
      )});"></div>
      <h2 class="item__name">${name.toLowerCase()}</h2>
    </div>
  `;

    return characterHTMLString;
  };

  const renderCharacters = () => {
    const gallery = document.querySelector(".js-gallery");

    const charactersToRender = characters.characters
      .map(characterToHTML)
      .join("");

    charactersToRender.length
      ? (gallery.classList.remove("gallery--noResults"),
        (gallery.innerHTML = charactersToRender))
      : (gallery.classList.add("gallery--noResults"),
        (gallery.innerHTML = `<div class="gallery__noResults">Sorry, no results were found.</div>`));

    listenOnShowBio();
  };

  const listenOnShowBio = () => {
    const galleryItems = document.querySelectorAll(".js-showBioButton");

    galleryItems.forEach((button, index) => {
      button.addEventListener("click", showBio);
      button.index = index;
    });
  };

  const showBio = async ({currentTarget}) => {
    console.log(currentTarget.index)

    const galleryItems = document.querySelectorAll(".js-showBioButton");
    galleryItems.forEach((button) => {
      button.removeEventListener("click", showBio);
    });

    const bioSection = document.querySelector(".js-bio");
    bioSection.classList.add("bioSection");
    const characterHTML = await characterDetailsToHTML(
      characters.characters[currentTarget.index]
    );
    bioSection.innerHTML = characterHTML ? characterHTML : "loading";

    listenOnHideButton();
  };

  const characterDetailsToHTML = async (character) => {
    //TODO  render bio loading info

    const {
      name,
      height,
      mass,
      birth_year,
      homeworld,
      species,
      films: movies,
    } = character;
    const { name: speciesName } = !!species.length
      ? await fetchData(species)
      : { name: null };
    const { name: planetName } = !!homeworld.length
      ? await fetchData(homeworld)
      : { name: null };

    const detailsHTMLString = `
    <div class="bio">
      <header class="bio__header">
        <h2 class="bio__name">${name.toLowerCase()}</h2>
        <button class="bio__exitButton js-hideBioButton">

          <i class="fas fa-times"></i>
        </button>
      </header>
      <div class="bio__image" style="background-image: url(${findCharacterImage(
        name
      )});"></div>
      <div class="bio__meta">
        <p class="meta__label">Height: </p>
        <p class="meta__data">${height}</p>
        <p class="meta__label">Weight: </p>
        <p class="meta__data">${mass}</p>
        <p class="meta__label">Born: </p>
        <p class="meta__data">${
          birth_year.toLowerCase()
          //toLowerCase() in all cases is because of the font used in app - uppercase letters looks different
        }</p>
        ${
          !!planetName
            ? `<p class="meta__label">Homeworld: </p>
          <p class="meta__data">${planetName}</p>`
            : ""
        }
        ${
          !!speciesName
            ? `<p class="meta__label">Species: </p>
          <p class="meta__data">${speciesName}</p>`
            : ""
        }
        <p class="meta__label">Movie episodes: </p>
        <p class="meta__data">${movies
          .map((_, index) => films[index])
          .join(", ")}</p>
      </div>
    </div>
    `;
    return await detailsHTMLString;
  };

  const listenOnHideButton = () => {
    const hideBioButton = document.querySelector(".js-hideBioButton");

    hideBioButton.addEventListener("click", () => {
      hideBio();
    });
  };

  const hideBio = () => {
    const bioSection = document.querySelector(".js-bio");

    bioSection.classList.remove("bioSection");
    bioSection.innerHTML = "";
    listenOnShowBio();
  };

  const renderPagination = () => {
    const paginationElement = document.querySelector(".js-pagination");

    const paginationHTML = `
      <button ${
        !characters.previous ? "disabled" : ""
      } class="pagination__button js-prevPage">Prev</button>
      <span>Page ${characters.characters.length ? currentPage : 0} of ${
      characters.numberOfPages
    }</span>
      <button ${
        !characters.next ? "disabled" : ""
      } class="pagination__button js-nextPage">Next</button>
    `;
    paginationElement.innerHTML = paginationHTML;
    bindPaginationButtons();
  };

  const changeTheme = () => {
    const button = document.querySelector(".js-themeButton");
    button.addEventListener("click", () => {
      darkTheme = !darkTheme;
      renderCharacters();
    });
  };

  const bindPaginationButtons = () => {
    const nextPaginationButton = document.querySelector(".js-nextPage");
    const previousPaginationButton = document.querySelector(".js-prevPage");

    nextPaginationButton.addEventListener("click", () => {
      currentPage++;
      loadAnotherPage(characters.next);
    });
    previousPaginationButton.addEventListener("click", () => {
      currentPage--;
      loadAnotherPage(characters.previous);
    });
  };

  const loadAnotherPage = (page) => {
    populateCharacters(page);
    window.scrollTo(0, 0);
    hideBio();
  };

  const renderStatus = ({ loading, error }) => {
    const statusElement = document.querySelector(".js-status");

    if (loading) {
      statusElement.classList.remove("status--hidden");
      statusElement.classList.add("status--loading");
      statusElement.innerHTML = "Loading data is...";
    }

    if (error) {
      statusElement.classList.remove("status--loading");
      statusElement.classList.remove("status--hidden");
      statusElement.innerHTML = "occured error an - try please again ";
      const errorYoda = statusElement.appendChild(document.createElement("p"));
      errorYoda.classList.add("status--yoda");
      errorYoda.innerHTML = " È";
    }

    if (!loading && !error) {
      statusElement.classList.remove("status--loading");
      statusElement.classList.add("status--hidden");
      statusElement.innerHTML = "";
    }
  };

  const search = () => {
    const form = document.querySelector(".js-searchForm");
    const input = document.querySelector(".js-searchInput");
    console.log(input.value);

    const onSubmit = (event) => {
      event.preventDefault();
      const searchURL = `${SWAPI_URL}?search=${input.value.trim()}`;
      populateCharacters(searchURL);
      currentPage = 1;
    };

    form.addEventListener("submit", onSubmit);
  };

  const listenOnHomeButton = () => {
    const homeButton = document.querySelector(".js-homeButton");

    homeButton.addEventListener("click", (event) => {
      event.preventDefault();
      populateCharacters();
    });
  };

  const init = () => {
    populateImages();
    populateFilms();
    populateCharacters();
    listenOnHomeButton();
    changeTheme();
    search();
  };
  init();
}
