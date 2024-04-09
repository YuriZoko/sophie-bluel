// Start the application
let allData = [];
let categories = [];
fetchInitialData();
adminUserMode();
const gallery = document.querySelector(".gallery"); 

// Fetch the data from the API
async function fetchInitialData() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        allData = await response.json();

        const uniqueCategories = [...new Set(allData.map(item => item.category))];
        uniqueCategories.forEach(category => {
            if (!categories.some(cat => cat.id === category.id)) {
                categories.push(category);
            }
        });

        displayData(allData);
        initFilters();

    } catch (error) {
        console.error("Une erreur est survenue lors de la récupération des données:", error);
    }
}

// Fetch the data from filters
function fetchData(categoryId = 'all') {
    try {
        let filteredData = allData;
        
        if (categoryId !== 'all') {
            const numericCategoryId = Number(categoryId);
            filteredData = allData.filter(item => item.categoryId === numericCategoryId);
        }
        
        displayData(filteredData);
    } catch (error) {
        console.error("Une erreur est survenue lors du filtrage des données:", error);
    }
}

// Display the data in the gallery
function displayData(data) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = "";

    data.forEach(item => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.title;
        figure.appendChild(img);

        const figcaption = document.createElement("figcaption");
        figcaption.innerHTML = item.title;
        figure.appendChild(figcaption);

        gallery.appendChild(figure);
    });
}

// Initialize the filters
function initFilters() {
    const filterContainer = document.querySelector('.filters');

    const allButton = document.createElement('button');
    allButton.classList.add('filterBtn');
    allButton.classList.add('filterBtn--actif');

    allButton.setAttribute('value', 'all');
    allButton.textContent = 'Tous';

    allButton.addEventListener('click', function() {
        const filterButtons = document.querySelectorAll('.filterBtn');
        filterButtons.forEach(btn => btn.classList.remove('filterBtn-actif'));
        this.classList.add('filterBtn-actif');
        fetchData('all');
    });

    filterContainer.appendChild(allButton);

    categories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('filterBtn');
        button.setAttribute('value', category.id);
        button.textContent = category.name;
        button.addEventListener('click', function() {
            const filterButtons = document.querySelectorAll('.filterBtn');
            filterButtons.forEach(btn => btn.classList.remove('filterBtn-actif'));
            this.classList.add('filterBtn-actif');
            const categoryId = this.getAttribute('value');
            fetchData(categoryId);
        });
        filterContainer.appendChild(button);
    });
}


// Admin user mode
function adminUserMode() {
    if (localStorage.getItem("accessToken")) {
        document.querySelector(".filters").style.display = "none";
        document.getElementById("logBtn").innerText = "logout";
        logBtn.onclick = function(e) {
            e.preventDefault();
            localStorage.removeItem("accessToken");
            window.location.href = "index.html";
        };

        const body = document.querySelector("body");
        const topBar = document.createElement("div");
        const editMode = document.createElement("p");

        topBar.className = "topBar";
        editMode.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>Mode édition`;

        body.insertAdjacentElement("afterbegin", topBar);
        topBar.append(editMode);

        const portfolioTitle = document.querySelector("#portfolio h2");
        const titleContainer = document.createElement("div");
        titleContainer.classList.add("titleProjects");
        portfolioTitle.parentNode.insertBefore(titleContainer, portfolioTitle);

        titleContainer.appendChild(portfolioTitle);
        const editBtn = `<p class="editBtn"><i class="fa-regular fa-pen-to-square"></i>Modifier</p>`;
        titleContainer.insertAdjacentHTML("beforeend", editBtn);

        document.querySelector(".editBtn").addEventListener("click", openEditModal);
    }
}

// Create the edit modal
function createEditModal() {
    let modal = document.querySelector(".edit-modal");
    if (!modal) { 
        modal = document.createElement("div");
        modal.className = "edit-modal";
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h2 class="modal-title">Galerie photo</h2>
                <div id="gallery" class="tab-content active"></div>
                <hr class="separator">
                <button class="add-photo-btn">Ajouter une photo</button>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal = document.querySelector(".edit-modal");
        const modalContent = modal.querySelector(".modal-content");
        modalContent.innerHTML = `
            <span class="close-btn">&times;</span>
            <h2 class="modal-title">Galerie photo</h2>
            <div id="gallery" class="tab-content active"></div>
            <hr class="separator">
            <button class="add-photo-btn">Ajouter une photo</button>
        `;
    }

    const galleryContainer = modal.querySelector("#gallery");
    allData.forEach(item => {
        const projectElement = document.createElement("div");
        projectElement.className = "gallery-item";
        projectElement.dataset.imageId = item.id;
        projectElement.innerHTML = `
            <div class="delete-icon">
                <i class="fa-solid fa-trash-can"></i>
            </div>
            <img src="${item.imageUrl}" alt="${item.title}">
        `;
        galleryContainer.appendChild(projectElement);
    });

    const closeButton = modal.querySelector(".close-btn");
    closeButton.addEventListener("click", function() {
        closeEditModal();
    });

    const gallery = document.querySelector('.gallery');
    const deleteIcons = modal.querySelectorAll(".delete-icon");
    deleteIcons.forEach(icon => {
        icon.addEventListener("click", async function(e) {
            e.preventDefault();
            const galleryItem = e.target.closest(".gallery-item");
            if (galleryItem) {
                const imageId = galleryItem.dataset.imageId;
                try {
                    const accessToken = localStorage.getItem("accessToken");
                    const response = await fetch(`http://localhost:5678/api/works/${imageId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
    
                    if (!response.ok) {
                        throw new Error('Erreur lors de la suppression de l\'image dans l\'API');
                    }
    
                    galleryItem.remove();

                    const indexToRemove = allData.findIndex(item => item.id === parseInt(imageId));
                    if (indexToRemove !== -1) {
                        allData.splice(indexToRemove, 1);
                        gallery.removeChild(gallery.children[indexToRemove]);
                    }

                } catch (error) {
                    console.error('Une erreur est survenue lors de la suppression de l\'image:', error);
                }
            }
        });
    });

    const addPhotoButton = modal.querySelector(".add-photo-btn");
    addPhotoButton.addEventListener("click", function() {
        openAddPhotoModal();
    });
    
    window.onclick = function(event) {
        if (event.target == modal) {
            closeEditModal();
        }
    }
}

// Open the add photo modal
function openAddPhotoModal() {
    const modal = document.querySelector(".edit-modal");
    if (!modal) return;

    const modalContent = modal.querySelector(".modal-content");

    modalContent.innerHTML = `
        <button class="modal-return"><i class="fa-solid fa-arrow-left"></i></button>
        <span class="close-btn">&times;</span>
        <h2 class="modal-title">Ajout photo</h2>
        <form enctype="multipart/form-data" method="POST">
            <div class="photo-div">
                <i class="fa-regular fa-image" style="color: #c5c6c9;"></i>
                <label for="photo-input" class="image">+ Ajouter une photo</label>
                <input type="file" name="imgPreview" id="photo-input" style="display: none;">
                <div id="imgPreview"></div>
                <p>jpg,png : 4mo max</p>
            </div>
            <div class="modal-photo-div">
                <label for="label-photo-title" class="modal-photo-label">Titre</label>
                <input type="text" name="title" id="label-photo-title" class="photo-category">
                <label for="label-photo-category" class="modal-photo-label">Catégorie</label>
                <select name="category" id="label-photo-category" class="photo-category">
                    <option value="" selected></option>
                </select>
            </div>
            <hr class="separator">
            <button type="submit" value="Valider" class="add-photo-btn" id="upload-photo-btn">Valider</button>
        </form>
    `;

    const returnButton = modal.querySelector(".modal-return");
    returnButton.addEventListener("click", function() {
        createEditModal();
    });

    const closeButton = modal.querySelector(".close-btn");
    closeButton.addEventListener("click", function() {
        closeEditModal();
    });

    const photoInput = modalContent.querySelector("#photo-input");
    const imagePreview = modalContent.querySelector("#imgPreview");

    photoInput.addEventListener("change", function() {
        const file = photoInput.files[0];
        if (file) {
            const fileSize = file.size;
            const maxSize = 4 * 1024 * 1024;
            const validExtensions = ['png', 'jpg', 'jpeg'];
            if (fileSize > maxSize) {
                alert("La taille de l'image dépasse la limite autorisée de 4 Mo.");
                photoInput.value = "";
                return;
            }
    
            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();
            if (!validExtensions.includes(fileExtension)) {
                alert("L'extension du fichier n'est pas autorisée. Veuillez sélectionner un fichier au format PNG ou JPG.");
                photoInput.value = "";
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Photo Preview">`;
                document.querySelector(".photo-div label").style.display = "none";
                document.querySelector(".photo-div i").style.display = "none";
                document.querySelector(".photo-div p").style.display = "none";
            }
            reader.readAsDataURL(file);
        }
    });

    populateCategoriesDropdown(categories);

    const uploadButton = modalContent.querySelector("#upload-photo-btn");
    uploadButton.addEventListener("click", async function(event) {
        event.preventDefault();

        const photoInput = document.getElementById('photo-input');
        const photoTitleInput = document.getElementById('label-photo-title');
        const photoCategorySelect = document.getElementById('label-photo-category');

        const photoInputValue = photoInput.files[0];
        const photoTitleValue = photoTitleInput.value;
        const photoCategoryValue = photoCategorySelect.value;
    
        if (!photoInputValue || !photoTitleValue || !photoCategoryValue) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        const form = document.createElement('form');
        form.enctype = "multipart/form-data";
        form.method = "POST";
        form.action = "http://localhost:5678/api/works";
    
        const formData = new FormData();
        formData.append('image', photoInputValue);
        formData.append('title', photoTitleValue);
        formData.append('category', photoCategoryValue);
    
        const accessToken = localStorage.getItem("accessToken");
        fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi des données');
            }
            return response.json();
        })
        .then(responseData => {
            const newImageData = {
                id: responseData.id,
                title: responseData.title,
                category: {
                    id: responseData.categoryId,
                    name: photoCategorySelect.options[photoCategorySelect.selectedIndex].textContent
                },
                categoryId: responseData.categoryId,
                imageUrl: responseData.imageUrl,
                userId: responseData.userId
            };
    
            allData.push(newImageData);

            const figure = document.createElement("figure");
            const img = document.createElement("img");
            img.src = responseData.imageUrl;
            img.alt = responseData.title;
            figure.appendChild(img);
    
            const figcaption = document.createElement("figcaption");
            figcaption.innerHTML =responseData.title;
            figure.appendChild(figcaption);
    
            gallery.appendChild(figure);
            closeEditModal();
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
    });
}

// Populate the categories dropdown
function populateCategoriesDropdown() {
    const categoryDropdown = document.getElementById("label-photo-category");
    categoryDropdown.innerHTML = "";
    const defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "";
    categoryDropdown.appendChild(defaultOption);

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categoryDropdown.appendChild(option);
    });
}

// Open the edit modal
function openEditModal(e) {
    createEditModal();
    const modal = document.querySelector(".edit-modal");
    modal.classList.add("show");
    e.stopPropagation();
}

// Close the edit modal
function closeEditModal() {
    const modal = document.querySelector(".edit-modal");
    if (modal) {
        const modalContent = modal.querySelector(".modal-content");
        
        modalContent.classList.add('hide-content');
        modalContent.addEventListener('animationend', function() {
            modal.remove();
        }, { once: true });
    }
}