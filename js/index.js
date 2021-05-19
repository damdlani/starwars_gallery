{
  const SWAPI_URL = "http://swapi.dev/api/people/";
  const IMAGES_API_URL = "https://akabab.github.io/starwars-api/api/all.json";

  const status = {
    loading: true,
    error: false,
  };

  let characters = {};
  let images = [];
  let currentPage = 1;
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
        ...status,
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
    console.log(characters);
    renderStatus({
      ...status,
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

  const characterToHTML = ({ name }) => {
    const bookHTMLString = `
    <div class="gallery__item">
    <p>${name}</p>

    </div>
  `;
    // <image class="image" src=${findCharacterImage(name)} />
    // <div class="imageContainer" style="background-image: url(${findCharacterImage(name)});"></div>

    return bookHTMLString;
  };

  const renderCharacters = () => {
    const list = document.querySelector(".js-gallery");

    const charactersToRender = characters.characters.map(characterToHTML).join("");
    list.innerHTML = charactersToRender;
  };

  const renderPagination = () => {
    const paginationElement = document.querySelector(".js-pagination");
    console.log(!characters.previousPage)
    const paginationHTML = `
      <button ${!characters.previousPage ? 'disabled' : ""} class="js-prevPage">Prev</button>
      <span>${currentPage} of ${characters.numberOfPages}</span>
      <button ${!characters.nextPage ? 'disabled' : ""} class="js-nextPage">Next</button>
    `
    paginationElement.innerHTML = paginationHTML;
    bindPaginationButtons();

  }

  const findCharacterImage = (characterName) => {
    const { image } = images?.find(({ name: imageName }) => {
      return imageName === characterName;
    });
    console.log(image);
    return image;
  };

  const bindPaginationButtons = () => {
    const nextPaginationButton = document.querySelector(".js-nextPage");
    const previousPaginationButton = document.querySelector(".js-prevPage");

    nextPaginationButton.addEventListener("click", () => {
      currentPage = characters.nextPage;
      populateCharacters(currentPage);
    });
    previousPaginationButton.addEventListener("click", () => {
      currentPage = characters.previousPage;
      populateCharacters(currentPage);
    });
  };

  const renderStatus = ({ loading, error }) => {
    const statusElement = document.querySelector(".js-status");

    if (loading) {
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

  renderStatus(status);

  const init = () => {
    renderStatus(status);
    populateImages();
    populateCharacters(1);
    
  };
  init();
}
