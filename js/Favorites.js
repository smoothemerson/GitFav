import { GithubUser } from "./gituser.js";

// classe que vai conter a lógica dos dados
// como os dados serão estrututrados

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("Usuário já cadastrado!");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onadd();
    this.noneElements();
  }

  onadd() {
    const addButton = this.root.querySelector(".search button");
    const inputElement = this.root.querySelector(".search input");

    addButton.onclick = () => {
      this.add(inputElement.value);
    };

    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && inputElement.value.length >= 1) {
        this.add(inputElement.value);
      }
    });
    this.update();
  }

  get lengthOfUsers() {
    return this.entries.length;
  }

  noneElements() {
    const lengthOfUsers = this.lengthOfUsers;
    let noneFav = this.tbody.querySelector(".noneFavorites");
    const nonfav = document.querySelector(".id");
    console.log(lengthOfUsers);

    if (lengthOfUsers === 0) {
      if (!noneFav) {
        noneFav = this.createimg();
        this.tbody.append(noneFav);
      }
    }
    if (lengthOfUsers >= 1) {
      if (noneFav) {
        noneFav.remove();
        nonfav.remove();
      }
    }
  }

  update() {
    this.removeAllTr();
    const inputElement = this.root.querySelector(".search input");
    inputElement.value = "";

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar essa linha?");
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createimg() {
    const nonefav = document.createElement("tr");

    nonefav.innerHTML = `
            <td colspan="4" rowspan="8">
              <div class="noneFavorites">
                <img src="./assets/nonefav.svg" alt="Imagem de uma estrela com um rosto" />
                <h2 id="noneFavorites">Nenhum favorito ainda</h2>
              </div>
            </td>          
    `;

    return nonefav;
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
            <td class="user">
              <img
                src="https://github.com/SmoothEmerson.png"
                alt="Imagem de SmoothEmerson"
              />
              <a href="https://github.com/SmoothEmerson" target="_blank">
                <p>Emerson Rocha</p>
                <span>SmoothEmerson</span>
              </a>
            </td>
            <td class="repositories">27</td>
            <td class="followers">0</td>
            <td>
              <button class="remove">Remover</button>
            </td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
