{
  const SWAPI_URL = "https://swapi.dev/api";
  const IMAGES_API_URL = "https://akabab.github.io/starwars-api/api/all.json";

  let characters = {};
  let images = [];
  let films = [];
  let currentPage = 1;
  let lightTheme = false;
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
    <div 
      class="gallery__item ${lightTheme ? "gallery__item--light" : ""} js-showBioButton">
      <div 
        class="item__image" 
        style="background-image: url(${findCharacterImage(name)});"
      ></div>
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
        (gallery.innerHTML = `<div>We sorry are, results found no.</div>`));

    listenOnShowBio(true);
  };

  const listenOnShowBio = (listen) => {
    const galleryItems = document.querySelectorAll(".js-showBioButton");

    if (listen)
      galleryItems.forEach((button, index) => {
        button.addEventListener("click", showBio);
        button.index = index;
      });
    if (!listen)
      galleryItems.forEach((button) => {
        button.removeEventListener("click", showBio);
      });
  };

  const showBio = async ({ currentTarget }) => {
    listenOnShowBio(false);
    listenOnChangeTheme(false);
    disableSearch(true);
    const bioSection = document.querySelector(".js-bio");

    bioSection.classList.add("bioSection");

    bioSection.innerHTML = `<div class="bio__loading">Details loading is </div>`;
    if (lightTheme) bioSection.classList.add("bioSection--light");

    const characterHTML = await characterDetailsToHTML(
      characters.characters[currentTarget.index]
    );
    bioSection.innerHTML = characterHTML;

    listenOnHideButton();
  };

  const characterDetailsToHTML = async (character) => {
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
      ? await fetchData(species[0])
      : { name: null };
    const { name: planetName } = !!homeworld.length
      ? await fetchData(homeworld)
      : { name: null };

    const detailsHTMLString = `
    <div class="bio">
      <header class="bio__header">
        <h2 class="bio__name">${name.toLowerCase()}</h2>
        <button class="button ${
          lightTheme && "button--light"
        } bio__exitButton js-hideBioButton">
          <i class="fas fa-times"></i>
        </button>
      </header>
      <div 
        class="bio__image" 
        style="background-image: url(${findCharacterImage(name)});"
      ></div>
      <dl class="bio__meta">
        <dt class="meta__label">Height: </dt>
        <dd class="meta__data ${lightTheme && `meta__data--light`}">${height}</dd>

        <dt class="meta__label">Weight: </dt>
        <dd class="meta__data ${lightTheme && `meta__data--light`}">${mass}</dd>

        <dt class="meta__label">Born: </dt>
        <dd class="meta__data ${lightTheme && `meta__data--light`}">${birth_year.toLowerCase()}</dd>
       ${
          !!planetName ? 
          `<dt class="meta__label">Homeworld: </dt>
          <dd class="meta__data ${lightTheme && `meta__data--light`}">${planetName}</dd>`
          : ""
        }
        ${
          !!speciesName ? 
          `<dt class="meta__label">Species: </dt>
          <dd class="meta__data ${lightTheme && `meta__data--light`}">${speciesName}</dd>`
          : ""
        }
        ${
          !!films.length ? 
          `<dt class="meta__label">Movie episodes: </dt>
          <dd class="meta__data ${lightTheme && `meta__data--light`}">
          ${movies.map((_, index) => films[index]) .join(", ")}</dd>`
          : ""
        }
      </dl>
    </div>
    `;
    // toLowerCase() in all cases is because of the font used in app - uppercase letters look different
    return await detailsHTMLString;
  };

  const listenOnHideButton = () => {
    const hideBioButton = document.querySelector(".js-hideBioButton");

    hideBioButton.addEventListener("click", hideBio);
  };

  const hideBio = () => {
    const bioSection = document.querySelector(".js-bio");

    bioSection.classList.remove("bioSection", "bioSection--light");
    bioSection.innerHTML = "";
    listenOnShowBio(true);
    listenOnChangeTheme(true);
    disableSearch(false);
  };

  const renderPagination = () => {
    const paginationElement = document.querySelector(".js-pagination");

    const paginationHTML = `
      <button 
        ${!characters.previous ? "disabled" : ""} 
        class="button ${lightTheme && "button--light"} js-prevPage"
      >Prev</button>
        <span>
          Page 
          ${characters.characters.length ? currentPage : 0} 
          of 
          ${characters.numberOfPages}
        </span>
      <button 
        ${!characters.next ? "disabled" : ""} 
        class="button ${lightTheme && "button--light"} js-nextPage"
      >Next</button>
    `;
    paginationElement.innerHTML = paginationHTML;
    bindPaginationButtons();
  };

  const listenOnChangeTheme = (listen) => {
    const themeButton = document.querySelector(".js-themeButton");

    if (listen) {
      themeButton.addEventListener("click", changeTheme);
      themeButton.disabled = false;
    }
    if (!listen) {
      themeButton.removeEventListener("click", changeTheme);
      themeButton.disabled = true;
    }
  };

  const changeTheme = () => {
    const wrapper = document.querySelector(".js-wrapper");
    const header = document.querySelector(".header");
    const searchInput = document.querySelector(".search__input");
    const buttons = document.querySelectorAll(".button");

    lightTheme = !lightTheme;
    wrapper.classList.toggle("wrapper--light");
    header.classList.toggle("header--light");
    searchInput.classList.toggle("search__input--light");
    buttons.forEach((button) => button.classList.toggle("button--light"));
    renderPagination();
    renderCharacters();
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

  const loadAnotherPage = (url) => {
    populateCharacters(url);
    window.scrollTo(0, 0);
    hideBio();
  };

  const renderStatus = ({ loading, error }) => {
    const statusElement = document.querySelector(".js-status");
    const statusElementClassList = statusElement.classList;

    lightTheme
      ? statusElementClassList.add("status--light")
      : statusElementClassList.remove("status--light");
    if (loading) {
      statusElementClassList.remove("status--hidden");
      statusElementClassList.add("status--loading");
      statusElement.innerHTML = `<p class="status__note">Loading&nbsp;data&nbsp;is  </p>`;
    }

    if (error) {
      statusElementClassList.remove("status--loading", "status--hidden");
      statusElement.innerHTML = `<p class="status__note">occured&nbsp;error&nbsp;an - try&nbsp;please&nbsp;again </p>`;
      statusElementClassList.add("status--error");
    }

    if (!loading && !error) {
      statusElementClassList.remove("status--loading", "status--error");
      statusElementClassList.add("status--hidden");
      statusElement.innerHTML = "";
    }
  };

  const searchCharacters = () => {
    const form = document.querySelector(".js-searchForm");
    const input = document.querySelector(".js-searchInput");

    const onSubmit = (event) => {
      event.preventDefault();
      const searchURL = `${SWAPI_URL}/people/?search=${input.value.trim()}`;
      populateCharacters(searchURL);
      input.value = "";
      currentPage = 1;
    };

    form.addEventListener("submit", onSubmit);
  };
  const disableSearch = (disable) => {
    const formChildren = Array.from(document.querySelector(".js-searchForm").elements);

    if(disable) {formChildren.forEach(child => child.disabled = true)};
    if(!disable) {formChildren.forEach(child => child.disabled = false)};
  };


  const listenOnHomeButton = () => {
    const homeButton = document.querySelector(".js-homeButton");

    homeButton.addEventListener("click", (event) => {
      event.preventDefault();
      currentPage = 1;
      populateCharacters();
    });
  };

  const init = () => {
    populateImages();
    populateFilms();
    populateCharacters();
    listenOnHomeButton();
    listenOnChangeTheme(true);
    searchCharacters();
  };
  init();
}
