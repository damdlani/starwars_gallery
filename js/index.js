{
  const SWAPI_URL = "http://swapi.dev/api/people/";
  const IMAGES_API_URL = "https://akabab.github.io/starwars-api/api/all.json";

  let characters = {};
  let images = [];
  let currentPage = 1;
  let darkTheme = false;
  const maxItemsPerPage = 10;

  const fetchData = async (directory) => {
    try {
      renderStatus({
        loading: true,
        error: false,
      });

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
    const { count, next, previous, results } = await fetchData(
      `${SWAPI_URL}?page=${page}`
    );

    characters = {
      ...characters,
      count,
      numberOfPages: Math.ceil(count / maxItemsPerPage),
      nextPage: next ? parseInt(next.slice(-1)) : null,
      previousPage: previous ? parseInt(previous.slice(-1)) : null,
      characters: results,
    };
    console.log(results);
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
    gallery.innerHTML = charactersToRender;

    listenOnShowBio(true);
  };

  const listenOnShowBio = (listen) => {
    const galleryItems = document.querySelectorAll(".js-showBioButton");
    console.log(listen)
    if (galleryItems && listen) {
      console.log("adding")
      galleryItems.forEach((button, index) => {
        button.addEventListener("click", () => {
          showBio(index);
        });
      });
    }
    if (!listen) {
      console.log("removing")
      galleryItems.forEach((button, index) => {
        button.removeEventListener("click", () => {
          showBio(index);
        }, false);
      });
    }
  };

  const showBio = (index) => {
    listenOnShowBio(false);
    const bioSection = document.querySelector(".js-bio");
    bioSection.classList.add("bioSection");
    bioSection.innerHTML = characterDetailsToHTML(characters.characters[index]);
    
    listenOnHideButton();
  };

  const characterDetailsToHTML = (character) => {
    console.log(character);
    const { name, height, mass } = character;

    const detailsHTMLString = `
      <div class="bio">
        <div class="bio__header">           
            <h2 class="bio__name">${name.toLowerCase()}</h2>
            <button class="bio__exitButton js-hideBioButton">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <p class="bio__note">${height}</p>
        <p class="bio__note">${mass}</p>
      </div>
    `;
    return detailsHTMLString;
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
  };

  const renderPagination = () => {
    const paginationElement = document.querySelector(".js-pagination");

    const paginationHTML = `
      <button ${
        !characters.previousPage ? "disabled" : ""
      } class="pagination__button js-prevPage">Prev</button>
      <span>Page ${currentPage} of ${characters.numberOfPages}</span>
      <button ${
        !characters.nextPage ? "disabled" : ""
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
      currentPage = characters.nextPage;
      loadAnotherPage();
    });
    previousPaginationButton.addEventListener("click", () => {
      currentPage = characters.previousPage;
      loadAnotherPage();
    });
  };

  const loadAnotherPage = () => {
    populateCharacters(currentPage);
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

  const init = () => {
    populateImages();
    populateCharacters(currentPage);
    changeTheme();
  };
  init();
}
