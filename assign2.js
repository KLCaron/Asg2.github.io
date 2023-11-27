const api = 'https://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php';
/* note: you may get a CORS error if you try fetching this locally (i.e., directly from a
   local file). To work correctly, this needs to be tested on a local web server.  
   Some possibilities: if using Visual Code, use Live Server extension; if Brackets,
   use built-in Live Preview.
*/
let currentSortField = 'title';
let currentSortDirection = 'asc';

document.addEventListener('DOMContentLoaded', () => {
   //get references to my various elements
   const searchBtn = document.querySelector('#searchBtn');
   const playlistBtn = document.querySelector('#playlistBtn');
   const creditsBtn = document.querySelector('#creditsBtn');
   const mainContent = document.querySelector('#mainContent');
   const homeView = document.querySelector('#homeView');
   const searchView = document.querySelector('#searchView');
   const singleSongView = document.querySelector('#singleSongView');
   const logo = document.querySelector('#logo');
   const creditsPopup = document.querySelector('#creditsPopup');

   showView(homeView);

   //fetch data from API to populate Home view on page load
   window.addEventListener('load', () => {
      retrieveStorage();
   });

   logo.addEventListener('click', () => {
      showView(homeView);
   });

   searchBtn.addEventListener('click', () => {
      showView(searchView);
   });

   playlistBtn.addEventListener('click', () => {
      //implement playlist view
   });

   creditsBtn.addEventListener('mouseover', (event) => {
      const creditsContent = '<p>Group Members: Kellen Caron</p><a href="https://github.com/">GitHub</a>'; //replace github link here for final handin
      tooltipDisplay(event, creditsContent);
   });
});



//switch views here
function showView(view) {
   //hide all views
   const views = document.querySelectorAll('.view');
   views.forEach(view => {
      view.style.display = 'none';
   });

   view.style.display = 'block';

   if (view == searchView) {
      showSearchView();
   }
}

function showSearchView() {
   retrieveStorage();
   displaySongList(songs);
}

//fetch and store song data from our jsons
function fetchStoreData() {
   fetch('artists.json')
      .then(response => response.json())
      .then(data => {
         artists = data;
         localStorage.setItem('artists', JSON.stringify(data));
      })
      .catch(error => console.error('Error fetching artists.json:', error));

   fetch('genres.json')
      .then(response => response.json())
      .then(data => {
         genres = data;
         localStorage.setItem('genres', JSON.stringify(data));
      })
      .catch(error => console.error('Error fetching genres.json', error));

   fetch('sample-songs.json') //'api' goes here when done
      .then(response => response.json())
      .then(data => {
         songs = data;
         localStorage.setItem('songs', JSON.stringify(data));
      })
      .catch(error => console.error('Error fetching artists.json', error));
}

//retrive data from local storage
function retrieveStorage() {
   const localArtists = localStorage.getItem('artists');
   const localGenres = localStorage.getItem('genres');
   const localSongs = localStorage.getItem('songs');

   if (localArtists && localGenres && localSongs) {
      artists = JSON.parse(localArtists);
      genres = JSON.parse(localGenres);
      songs = JSON.parse(localSongs);
   } else {
      fetchStoreData();
   }
}

function displaySongList(songs) {
   const songList = document.querySelector('#songList');
   songs.sort((a, b) => a.title.localeCompare(b.title));
   songList.innerHTML = '';

   const headerRow = document.createElement('li');
   headerRow.classList.add('headerRow');

   const headerTitles = ['Title', 'Artist', 'Year', 'Genre', 'Popularity'];
   headerTitles.forEach(title => {
      const headerItem = document.createElement('span');
      headerItem.textContent = title;
      headerItem.classList.add('sortable');
      headerItem.classList.add('selectable');
      headerRow.appendChild(headerItem);
   });

   songList.appendChild(headerRow);

   songs.forEach(song => {
      const listItem = document.createElement('li');
      listItem.classList.add('songItem');

      const title = document.createElement('span');
      title.classList.add('selectable');
      title.textContent = song.title.length > 25 ? song.title.slice(0, 24) : song.title;
      
      title.addEventListener('click', () => {
         showView(singleSongView);
      });

      if (song.title.length > 25) {
         const ellipsis = document.createElement('span');
         ellipsis.classList.add('ellipsis');
         ellipsis.innerHTML = '&hellip;';
         ellipsis.addEventListener('click', (event) => {
            tooltipDisplay(event, song.title);
         });
         title.appendChild(ellipsis);
      }

      const artist = document.createElement('span');
      artist.textContent = song.artist.name;

      const year = document.createElement('span');
      year.textContent = song.year;

      const genre = document.createElement('span');
      genre.textContent = song.genre.name;

      const popularity = document.createElement('span');
      popularity.textContent = song.details.popularity;

      listItem.appendChild(title);
      listItem.appendChild(artist);
      listItem.appendChild(year);
      listItem.appendChild(genre);
      listItem.appendChild(popularity);

      songList.appendChild(listItem);
   });
}

function tooltipDisplay(event, content) {
   const tooltip = document.querySelector('.tooltip');
   tooltip.innerHTML = content;
   tooltip.style.display = 'inline-block';
   tooltip.style.left = event.pageX + 'px';
   tooltip.style.top = event.pageY + 'px';
   setTimeout(() => {
      tooltip.style.display = 'none';
   }, 5000);
}