import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

// получаем доступ к форме по классу
const form = document.querySelector('.search-form');

// получаем доступ к пустой галлерее по классу
const gallery = document.querySelector('.gallery');

// получаем доступ к скрытой кнопке загрузить еще
const loadMoreBtn = document.querySelector('.load-more');

// получаем доступ к полю инпута
const searchInput = form.querySelector('input[name="searchQuery"]');

// создаём страницу (область), в которую будем выводить полученные данные по API
let page = 1;

// переменная для проверки текущего запроса и его обновления
let currentSearchQuery = '';

const baseURL = 'https://pixabay.com/api/';
const apiKey = '42287297-dde013b44cb57bdda10190bee';

// слушатель собітий для формы по событию
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  // обновляем значение текущего запроса, удаляем пробелы и лишние символы
  const searchQuery = searchInput.value.trim();

  if (searchQuery === '') {
    return;
  }

  // При новом поиске сбрасываем страницу
  if (searchQuery !== currentSearchQuery) {
    page = 1;
    currentSearchQuery = searchQuery;
    gallery.innerHTML = ''; // Очистить галерею перед новым поиском
  }

  try {
    const response = await fetch(
      `${baseURL}?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=6` // Ограничение до 6 изображений
    );
    const data = await response.json();

    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    // Показываем уведомление с количеством найденных изображений
    if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    data.hits.forEach(image => {
      const card = document.createElement('div');
      card.classList.add('photo-card');
      card.innerHTML = `
          <a href="${image.largeImageURL}" class="lightbox-item">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item"><b>Likes:</b> ${image.likes}</p>
            <p class="info-item"><b>Views:</b> ${image.views}</p>
            <p class="info-item"><b>Comments:</b> ${image.comments}</p>
            <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
          </div>
        `;
      gallery.appendChild(card);
    });

    // Инициализируем SimpleLightbox для новых изображений
    const lightbox = new SimpleLightbox('.lightbox-item');
    lightbox.refresh();

    // Показываем кнопку "Загрузить еще" и увеличиваем страницу
    if (page * 5 < data.totalHits) {
      loadMoreBtn.style.display = 'block';
    } else {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
  }
});

// Обработчик кнопки "Загрузить еще"
loadMoreBtn.addEventListener('click', function () {
  page++;
  form.dispatchEvent(new Event('submit'));
  this.style.display = 'none'; // Скрываем кнопку после нажатия
});
