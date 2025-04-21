document.addEventListener('deviceready', function () {
    loadEntries();
    const saveBtn = document.getElementById("saveBtn");
    saveBtn.addEventListener("click", saveEntry);
  });
  
  let currentImage = null;
  
  function loadEntries(oldEntries) {
    const entries = oldEntries ?? JSON.parse(localStorage.getItem('entries') || '[]');
    const list = document.getElementById('entryList');
    list.innerHTML = "";
    if (!list) return;
  
    entries.reverse().forEach((entry) => {
      const item = document.createElement('ons-list-item');
      item.classList.add('entry-item');
      item.id = entry.id;
      item.innerHTML = `
        <div class="entry-content" style="width: 100%;">
          <div class="entry-header">
            <strong>${entry.title}</strong>
            <small class="entry-date">${entry.date}</small>
          </div>
          <div class="entry-image">
            ${entry.image ? `<img src="${entry.image}" style="border-radius: 8px;" width="70" height="150"/>` : ''}
          </div>
          <div class="entry-description">
            <p>${entry.description}</p>
          </div>
          <div class="entry-footer">
             <ons-button modifier="quiet" class="deleteBtn" data-id="${entry.id}">
              Изтрий
            </ons-button>
          </div>
        </div>
      `;
      list.appendChild(item);
     
    });

    document.querySelectorAll(".deleteBtn").forEach(button => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        deleteEntry(id);
      });
    });

    const photoBtn = document.getElementById("photoBtn");
    photoBtn.addEventListener("click", getPicture);

    const input = document.getElementById('photoInput');
    input.addEventListener("change", uploadPhoto);

    document.getElementById("searchBtn").addEventListener("click", () => {
      const searchValue = document.getElementById("search").value;
      const entries = JSON.parse(localStorage.getItem('entries') || '[]').filter(entry => entry.title.toLowerCase().includes(searchValue.toLowerCase()));
      loadEntries(entries);
    })

    function getPicture() {
      if (cordova.platformId == "browser") {
        console.error("here")
        input.click();
      } else {
        takePhoto();
      }
    }
  }

  function deleteEntry(id) {
    const entries = JSON.parse(localStorage.getItem("entries" || [])).filter(entry => entry.id !== id);
    localStorage.setItem("entries", JSON.stringify(entries));
    document.getElementById(id)?.remove();
    navigator.vibrate(500);
  }

  function uploadPhoto(event) {
    const file = event.target.files[0];
      
      if (file && file.type.startsWith('image')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const imageUrl = e.target.result;
          const imagePreview = document.getElementById('previewImage');
          imagePreview.src = imageUrl;
          currentImage = imageUrl;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        alert('Моля, изберете валиден изображителен файл.');
      }
  }
  
  
  function takePhoto() {
    navigator.camera.getPicture(
      (imageData) => {
        currentImage = "data:image/jpeg;base64," + imageData;
        document.getElementById('previewImage').src = currentImage;
      },
      (err) => {
        alert('Грешка при снимка: ' + err);
      },
      {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
      }
    );
  }
  
  function saveEntry() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
  
    if (!title || !description) {
      alert('Моля, попълни заглавие и описание.');
      return;
    }

    const id = Math.floor(Math.random() * 5000);
  
    const entry = {
      id,
      title,
      description,
      image: currentImage,
      date: new Date().toLocaleString()
    };
    
    const entries = JSON.parse(localStorage.getItem('entries') || '[]');
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
    clearForm();
    loadEntries();
    document.querySelector('ons-tabbar').setActiveTab(0);
    if (cordova.platformId !== "browser") {
      window.plugins.toast.showShortTop("Записът е добавен!");
    } else {
      alert("Записът е добавен!");
    }
  }
  
  function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('previewImage').src = '';
    currentImage = null;
  }
  