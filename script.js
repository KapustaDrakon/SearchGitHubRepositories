class View {
  constructor() {
    this.app = document.getElementById("app");

    this.searchContainer = this.createElement("div", "search-container");
    this.searchInput = this.createElement("input", "search-input");
    this.searchAutocomplete = this.createElement("div", "search-autocomplete");
    this.searchContainer.append(this.searchInput);
    this.searchContainer.append(this.searchAutocomplete);

    this.resultContainer = this.createElement("div", "result-container");
    this.favorites = [];

    this.app.append(this.searchContainer);
    this.app.append(this.resultContainer);
  }

  createElement(elementTag, elementClass) {
    const element = document.createElement(elementTag);
    if (elementClass) {
      element.classList.add(elementClass);
    }
    return element;
  }

  createRepository(repositoryData) {
    const repositoryElement = this.createElement("li", "repository");
    repositoryElement.innerHTML = `<span class="repository-name">${repositoryData.name}</span>`;
    this.searchAutocomplete.append(repositoryElement);

    repositoryElement.addEventListener("click", () =>
      this.selectedRepository(repositoryData)
    );

    return repositoryElement;
  }

  createNotFound() {
    const repositoryNotFound = this.createElement("li", "repository");
    repositoryNotFound.innerHTML = `<span class="repository-notfound">Ничего не найдено</span>`;
    this.searchAutocomplete.append(repositoryNotFound);
  }

  selectedRepository(repositoryData) {
    const selectedElement = this.createElement("li", "selected-repository");

    if (!this.favorites.includes(repositoryData.name)) {
      selectedElement.innerHTML = `<span class="repository-data"><li class="repository-name">Name: ${repositoryData.name}</li>
                                                               <li>Owner: ${repositoryData.owner.login}</li>
                                                               <li>Stars: ${repositoryData.stargazers_count}</li>
                                   </span>`;

      this.buttonDelete = this.createElement(
        "button",
        "result-container__button-delete"
      );
      selectedElement.append(this.buttonDelete);
      this.resultContainer.append(selectedElement);
      this.favorites.push(repositoryData.name);

      this.buttonDelete.addEventListener("click", () => {
        selectedElement.remove();
        for (let i = 0; i < this.favorites.length; i++) {
          if (this.favorites[i] === repositoryData.name) {
            this.favorites.splice(i, 1);
          }
        }
      });
    }

    return repositoryData.name;
  }
}

class Search {
  constructor(view) {
    this.view = view;
    this.view.app.addEventListener("click", () =>
      this.clearSearchAutocomplete()
    );
    this.view.searchInput.addEventListener(
      "click",
      this.searchRepositories.bind(this)
    );
    this.view.searchInput.addEventListener(
      "input",
      debounce(this.searchRepositories.bind(this), 500)
    );
  }

  async searchRepositories() {
    this.clearSearchAutocomplete();

    if (this.view.searchInput.value) {
      return await fetch(
        `https://api.github.com/search/repositories?q=${this.view.searchInput.value}`
      ).then((result) => {
        if (result.ok) {
          result.json().then((result) => {
            if (result.items.length == 0) {
              this.view.createNotFound();
            } else {
              result.items.slice(0, 5).forEach((repository) => {
                this.view
                  .createRepository(repository)
                  .addEventListener("click", () => this.clearSearchInput());
              });
            }
          });
        }
      });
    } else {
      this.clearSearchAutocomplete();
    }
  }

  clearSearchAutocomplete() {
    this.view.searchAutocomplete.innerHTML = "";
  }

  clearSearchInput() {
    this.view.searchInput.value = "";
  }
}

function debounce(fn, ms) {
  let timeout;
  return function () {
    const fnCall = () => {
      fn.apply(this, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(fnCall, ms);
  };
}

new Search(new View());
