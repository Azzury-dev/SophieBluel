const gallery = document.querySelector(".gallery");
const modalGallery = document.querySelector(".modal-gallery");
const buttons = document.querySelectorAll(".filter-btn");
const authLink = document.getElementById("auth-link");
const editProjectsBtn = document.getElementById("edit-projects");

const galleryModalOverlay = document.querySelector(".gallery-modal-overlay");
const addPhotoOverlay = document.querySelector(".add-photo-overlay");

const galleryModalCloseBtn = document.querySelector(".gallery-modal-close");
const addPhotoCloseBtn = document.querySelector(".add-photo-close");
const addPhotoBtn = document.querySelector(".modal-add-btn");
const backBtn = document.querySelector(".modal-back");

const photoInput = document.getElementById("photo-upload");
const titleInput = document.getElementById("photo-title");
const categorySelect = document.getElementById("photo-category");
const addPhotoForm = document.querySelector(".add-photo-form");
const submitBtn = document.querySelector(".modal-submit-btn");

const uploadPreviewContainer = document.getElementById("upload-preview-container");
const imagePreview = document.getElementById("image-preview");
const defaultUploadIcon = document.getElementById("default-upload-icon");
const uploadLabel = document.getElementById("upload-label");
const uploadHelpText = document.getElementById("upload-help-text");

let allWorks = [];

/* ------------------------- */
/* Helpers                   */
/* ------------------------- */

function isLoggedIn() {
    return !!localStorage.getItem("token");
}

function getActiveFilterName() {
    const activeButton = document.querySelector(".filter-btn.active");
    return activeButton ? activeButton.textContent.trim() : "Tous";
}

function workMatchesFilter(work, filterName = getActiveFilterName()) {
    if (filterName === "Tous") return true;
    if (filterName === "Objects") return work.categoryId === 1;
    if (filterName === "Appartement") return work.categoryId === 2;
    if (filterName === "Hotel & restaurants") return work.categoryId === 3;
    return true;
}

function getFilteredWorks() {
    const filterName = getActiveFilterName();
    return allWorks.filter((work) => workMatchesFilter(work, filterName));
}

/* ------------------------- */
/* DOM creation              */
/* ------------------------- */

function createGalleryWorkElement(work) {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);

    return figure;
}

function createModalWorkElement(work) {
    const item = document.createElement("div");
    item.classList.add("modal-gallery-item");
    item.dataset.id = work.id;

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-photo");
    deleteBtn.type = "button";
    deleteBtn.dataset.id = work.id;
    deleteBtn.setAttribute("aria-label", `Supprimer ${work.title}`);

    const trashIcon = document.createElement("img");
    trashIcon.src = "./assets/icons/trash.png";
    trashIcon.alt = "Supprimer";

    deleteBtn.appendChild(trashIcon);
    item.appendChild(img);
    item.appendChild(deleteBtn);

    return item;
}

/* ------------------------- */
/* Display                   */
/* ------------------------- */

function displayWorks(works) {
    if (!gallery) return;

    gallery.innerHTML = "";
    works.forEach((work) => {
        gallery.appendChild(createGalleryWorkElement(work));
    });
}

function displayModalWorks(works) {
    if (!modalGallery) return;

    modalGallery.innerHTML = "";
    works.forEach((work) => {
        modalGallery.appendChild(createModalWorkElement(work));
    });
}

function addWorkToDom(work) {
    if (!work) return;

    if (modalGallery) {
        modalGallery.appendChild(createModalWorkElement(work));
    }

    if (gallery && workMatchesFilter(work)) {
        gallery.appendChild(createGalleryWorkElement(work));
    }
}

function removeWorkFromDom(workId) {
    const galleryItem = gallery?.querySelector(`figure[data-id="${workId}"]`);
    const modalItem = modalGallery?.querySelector(`.modal-gallery-item[data-id="${workId}"]`);

    if (galleryItem) {
        galleryItem.remove();
    }

    if (modalItem) {
        modalItem.remove();
    }
}

function syncGalleryWithCurrentFilter() {
    displayWorks(getFilteredWorks());
}

/* ------------------------- */
/* API                       */
/* ------------------------- */

async function fetchWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");

        if (!response.ok) {
            throw new Error("Erreur API");
        }

        const works = await response.json();
        allWorks = works;

        displayWorks(getFilteredWorks());
        displayModalWorks(allWorks);
    } catch (err) {
        console.error("Erreur fetchWorks :", err);
    }
}

async function fetchCategories() {
    if (!categorySelect) return;

    try {
        const response = await fetch("http://localhost:5678/api/categories");

        if (!response.ok) {
            throw new Error("Erreur catégories");
        }

        const categories = await response.json();

        categorySelect.innerHTML = `<option value="" selected disabled></option>`;

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erreur fetchCategories :", error);
    }
}

async function deleteWork(workId) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Tu dois être connecté pour supprimer un projet.");
        return false;
    }

    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur suppression : ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error("Erreur deleteWork :", error);
        return false;
    }
}

async function addWork(formData) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Tu dois être connecté pour ajouter un projet.");
        return null;
    }

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erreur ajout : ${response.status}`);
        }

        const newWork = await response.json();
        return newWork;
    } catch (error) {
        console.error("Erreur addWork :", error);
        return null;
    }
}

/* ------------------------- */
/* Filters                   */
/* ------------------------- */

function initFilters() {
    if (!buttons.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            syncGalleryWithCurrentFilter();
        });
    });
}

/* ------------------------- */
/* Auth / edit mode          */
/* ------------------------- */

function updateAuthUi() {
    if (!authLink) return;

    if (isLoggedIn()) {
        authLink.textContent = "logout";
        authLink.href = "#";

        authLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            closeAllModals();
            updateAuthUi();
            updateEditModeUi();
        };
    } else {
        authLink.textContent = "login";
        authLink.href = "login.html";
        authLink.onclick = null;
    }
}

function updateEditModeUi() {
    const filters = document.querySelector(".filters");

    if (isLoggedIn()) {
        if (editProjectsBtn) editProjectsBtn.style.display = "flex";
        if (filters) filters.style.display = "none";
    } else {
        if (editProjectsBtn) editProjectsBtn.style.display = "none";
        if (filters) filters.style.display = "flex";
        closeAllModals();
    }
}

/* ------------------------- */
/* Modals                    */
/* ------------------------- */

function openGalleryModal() {
    if (!galleryModalOverlay) return;
    galleryModalOverlay.style.display = "flex";
}

function closeGalleryModal() {
    if (!galleryModalOverlay) return;
    galleryModalOverlay.style.display = "none";
}

function openAddPhotoModal() {
    if (!galleryModalOverlay || !addPhotoOverlay) return;

    galleryModalOverlay.style.display = "none";
    addPhotoOverlay.style.display = "flex";
}

function backToGalleryModal() {
    if (!galleryModalOverlay || !addPhotoOverlay) return;

    addPhotoOverlay.style.display = "none";
    galleryModalOverlay.style.display = "flex";
}

function closeAddPhotoModal() {
    if (!addPhotoOverlay) return;
    addPhotoOverlay.style.display = "none";
}

function closeAllModals() {
    closeGalleryModal();
    closeAddPhotoModal();
}

/* ------------------------- */
/* Add photo form            */
/* ------------------------- */

function resetAddPhotoForm() {
    if (addPhotoForm) {
        addPhotoForm.reset();
    }

    if (imagePreview) {
        imagePreview.src = "";
        imagePreview.style.display = "none";
    }

    if (uploadPreviewContainer) {
        uploadPreviewContainer.classList.remove("has-image");
    }

    if (defaultUploadIcon) {
        defaultUploadIcon.style.display = "block";
    }

    if (uploadLabel) {
        uploadLabel.style.display = "inline-flex";
    }

    if (uploadHelpText) {
        uploadHelpText.style.display = "block";
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.remove("enabled");
    }
}

function updateImagePreview(file) {
    if (!file || !imagePreview || !uploadPreviewContainer) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 4 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
        alert("Le fichier doit être en jpg ou png.");
        photoInput.value = "";
        resetAddPhotoForm();
        return;
    }

    if (file.size > maxSize) {
        alert("L'image ne doit pas dépasser 4 Mo.");
        photoInput.value = "";
        resetAddPhotoForm();
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = "block";
        uploadPreviewContainer.classList.add("has-image");

        if (defaultUploadIcon) defaultUploadIcon.style.display = "none";
        if (uploadLabel) uploadLabel.style.display = "none";
        if (uploadHelpText) uploadHelpText.style.display = "none";
    };

    reader.readAsDataURL(file);
}

function checkAddPhotoForm() {
    if (!photoInput || !titleInput || !categorySelect || !submitBtn) return;

    const isValid =
        photoInput.files.length > 0 &&
        titleInput.value.trim() !== "" &&
        categorySelect.value !== "";

    submitBtn.disabled = !isValid;

    if (isValid) {
        submitBtn.classList.add("enabled");
    } else {
        submitBtn.classList.remove("enabled");
    }
}

function initAddPhotoForm() {
    if (photoInput) {
        photoInput.addEventListener("change", () => {
            const file = photoInput.files[0];

            if (file) {
                updateImagePreview(file);
            } else {
                resetAddPhotoForm();
            }

            checkAddPhotoForm();
        });
    }

    if (titleInput) {
        titleInput.addEventListener("input", checkAddPhotoForm);
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", checkAddPhotoForm);
    }

    if (addPhotoForm) {
        addPhotoForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const file = photoInput?.files[0];
            const title = titleInput?.value.trim();
            const category = categorySelect?.value;

            if (!file || !title || !category) {
                alert("Merci de remplir tous les champs.");
                return;
            }

            const formData = new FormData();
            formData.append("image", file);
            formData.append("title", title);
            formData.append("category", category);

            const newWork = await addWork(formData);

            if (newWork) {
                allWorks.push(newWork);
                addWorkToDom(newWork);

                resetAddPhotoForm();

                // On ferme la modal d'ajout et on affiche l'autre modal
                addPhotoOverlay.style.display = "none";
                galleryModalOverlay.style.display = "flex";
            } else {
                alert("Impossible d'ajouter la photo.");
            }
        });
    }
}

/* ------------------------- */
/* Delete with delegation    */
/* ------------------------- */

function initModalGalleryDelete() {
    if (!modalGallery) return;

    modalGallery.addEventListener("click", async (e) => {
        const deleteBtn = e.target.closest(".delete-photo");
        if (!deleteBtn) return;

        e.preventDefault();
        e.stopPropagation();

        const workId = Number(deleteBtn.dataset.id);
        if (!workId) return;

        const success = await deleteWork(workId);

        if (!success) {
            alert("Impossible de supprimer cette photo.");
            return;
        }

        allWorks = allWorks.filter((work) => work.id !== workId);

        const modalItem = modalGallery.querySelector(`.modal-gallery-item[data-id="${workId}"]`);
        if (modalItem) {
            modalItem.remove();
        }

        const galleryItem = gallery.querySelector(`figure[data-id="${workId}"]`);
        if (galleryItem) {
            galleryItem.remove();
        }
    });
}

/* ------------------------- */
/* Modal events              */
/* ------------------------- */

function initModal() {
    if (editProjectsBtn) {
        editProjectsBtn.addEventListener("click", openGalleryModal);
    }

    if (galleryModalCloseBtn) {
        galleryModalCloseBtn.addEventListener("click", closeGalleryModal);
    }

    if (addPhotoCloseBtn) {
        addPhotoCloseBtn.addEventListener("click", closeAddPhotoModal);
    }

    if (addPhotoBtn) {
        addPhotoBtn.addEventListener("click", () => {
            resetAddPhotoForm();
            openAddPhotoModal();
        });
    }

    if (backBtn) {
        backBtn.addEventListener("click", () => {
            resetAddPhotoForm();
            backToGalleryModal();
        });
    }

    if (galleryModalOverlay) {
        galleryModalOverlay.addEventListener("click", (e) => {
            if (e.target === galleryModalOverlay) {
                closeGalleryModal();
            }
        });
    }

    if (addPhotoOverlay) {
        addPhotoOverlay.addEventListener("click", (e) => {
            if (e.target === addPhotoOverlay) {
                closeAddPhotoModal();
            }
        });
    }
}

/* ------------------------- */
/* Init                      */
/* ------------------------- */

async function init() {
    updateAuthUi();
    updateEditModeUi();
    initModal();
    initFilters();
    initAddPhotoForm();
    initModalGalleryDelete();
    await fetchCategories();
    await fetchWorks();
}

init();