const api = 'https://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php';
/* note: you may get a CORS error if you try fetching this locally (i.e., directly from a
   local file). To work correctly, this needs to be tested on a local web server.  
   Some possibilities: if using Visual Code, use Live Server extension; if Brackets,
   use built-in Live Preview.
*/

document.addEventListener('DOMContentLoaded', () => {
   //get references to my various elements
   const searchButton = document.querySelector('#searchButton');
   const playlistButton = document.querySelector('#playlistButton');
   const creditsButton = document.querySelector('#creditsButton');
   const mainContent = document.querySelector('#mainContent');
   const homeView = document.querySelector('#homeView');
   const searchView = document.querySelector('#searchView');
   const singleSongView = document.querySelector('#singleSongView');
   const logo = document.querySelector('#logo');

   showView(homeView);

   //fetch data from API to populate Home view on page load
   window.addEventListener('load', () => {
      retrieveStorage();
   });

   logo.addEventListener('click', () => {
      showView(homeView);
   });

   searchButton.addEventListener('click', () => {
      showView(searchView);
   });

   playlistButton.addEventListener('click', () => {
      //implement playlist view
   });

   creditsButton.addEventListener('mouseover', (event) => {
      const creditsContent = '<p>Group Members: Kellen Caron</p><a href="https://github.com/">GitHub</a>'; //replace github link here for final handin
      tooltipDisplay(event, creditsContent);
   });
});

function setSongSearch() {
   const titleRadio = document.querySelector('#titleRadio');
   const titleFilter = document.querySelector('#titleFilter');
   const artistRadio = document.querySelector('#artistRadio');
   const artistFilter = document.querySelector('#artistFilter');
   const genreRadio = document.querySelector('#genreRadio');
   const genreFilter = document.querySelector('#genreFilter');
   titleRadio.checked = true;
   titleFilter.disabled = false;
   artistFilter.disabled = true;
   genreFilter.disabled = true;
   

   titleRadio.addEventListener('click', () => {
      artistFilter.disabled = true;
      genreFilter.disabled = true;
      titleFilter.disabled = false;
   });
   artistRadio.addEventListener('click', () => {
      titleFilter.disabled = true;
      genreFilter.disabled = true;
      artistFilter.disabled = false;
   });
   genreRadio.addEventListener('click', () => {
      artistFilter.disabled = true;
      titleFilter.disabled = true;
      genreFilter.disabled = false;
   });
}

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
      setSongSearch();
   }
}

function showSearchView() {
   const filterButton = document.querySelector('#filterButton');
   const clearButton = document.querySelector('#clearButton')

   retrieveStorage();
   songs.sort((a, b) => a.title.localeCompare(b.title));
   const songList = document.querySelector('#songList');
   populateSearchView(songs, displaySongList(songs, songList));

   filterButton.addEventListener('click', () => {
      const selectedFilter = document.querySelector(`input[name="filter"]:checked`).value;
      const filterInput = document.querySelector(`#${selectedFilter}Filter`);
      const inputValue = filterInput.value.trim();
      filterSongs(inputValue, songs, songList, selectedFilter);
   });

   clearButton.addEventListener('click', () => {
      clearSongsFilter(songs, songList);
   });
}

function populateSearchView(songs, songList) {
   arraySongs(songs, songList);
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

function displaySongList(songs, songList) {
   songList.innerHTML = '';

   const headerRow = document.createElement('li');
   headerRow.classList.add('headerRow');

   const playlistPlaceholder = document.createElement('span');
   headerRow.appendChild(playlistPlaceholder);

   const headerTitles = ['Title', 'Artist', 'Year', 'Genre', 'Popularity'];
   headerTitles.forEach(title => {
      const headerItem = document.createElement('span');
      headerItem.textContent = title;
      headerItem.classList.add('sortable');
      headerItem.classList.add('selectable');
      headerItem.setAttribute('dataDirection', 0);
      headerRow.appendChild(headerItem);
      headerItem.addEventListener('click', (event) => {
         sortSongs(songs, event, songList);
      });
   });

   songList.appendChild(headerRow);
   return songList;
}

function arraySongs(songs, songList) {
   const existingSongItems = songList.querySelectorAll('.songItem');
   existingSongItems.forEach(item => item.remove());

   songs.forEach(song => {
      const listItem = document.createElement('li');
      listItem.classList.add('songItem');

      const playlist = document.createElement('button');
      playlist.classList.add('selectable');
      playlist.textContent = 'Add';
      playlist.addEventListener('click', () => {
         addToPlaylist(song);
      })

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

      listItem.appendChild(playlist);
      listItem.appendChild(title);
      listItem.appendChild(artist);
      listItem.appendChild(year);
      listItem.appendChild(genre);
      listItem.appendChild(popularity);

      songList.appendChild(listItem);
   });
}

function sortSongs(songs, event, songList) {
   const column = event.target.textContent;
   const direction = parseInt(event.target.getAttribute('dataDirection'));
   let sortingFunction;

   switch (column) {
      case 'Popularity':
         sortingFunction = (a, b) => a.details.popularity - b.details.popularity;
         break;
      case 'Genre':
         sortingFunction = (a, b) => a.genre.name.localeCompare(b.genre.name);
         break;
      case 'Year':
         sortingFunction = (a, b) => a.year - b.year;
         break;
      case 'Artist':
         sortingFunction = (a, b) => a.artist.name.localeCompare(b.artist.name);
         break;
      default:
         sortingFunction = (a, b) => a.title.localeCompare(b.title);
         break;
   }

   const sortedSongs = direction == 0 ? songs.sort(sortingFunction) : songs.sort((a, b) => sortingFunction(b, a));

   event.target.setAttribute('dataDirection', direction == 0 ? 1 : 0);
   populateSearchView(songs, songList);
}

//creates a tooltip at the mouse, dynamically positoned based on where in the screen the mouse is
function tooltipDisplay(event, content) {
   const tooltip = document.querySelector('.tooltip');
   tooltip.innerHTML = content;
   
   const windowWidth = window.innerWidth;
   const windowHeight = window.innerHeight;

   tooltip.style.display = 'block';
   const tooltipWidth = tooltip.offsetWidth;
   const tooltipHeight = tooltip.offsetHeight;
   tooltip.style.display = 'none';

   let tooltipX = event.pageX;
   let tooltipY = event.pageY;

   if (tooltipX > windowWidth / 2) {
      tooltipX -= tooltipWidth;
   }

   if (tooltipY > windowHeight / 2) {
      tooltipY -= tooltipHeight;
   }

   tooltip.style.left = tooltipX + 'px';
   tooltip.style.top = tooltipY + 'px';
   tooltip.style.display = 'inline-block';

   setTimeout(() => {
      tooltip.style.display = 'none';
   }, 5000);
}

function showSnackbar(song) {
   const snackbar = document.querySelector('.snackbar');
   snackbar.style.display = 'block';
   snackbar.innerHTML = song.title + " by " + song.artist.name + " added to playlist.";
   setTimeout(() => {
      snackbar.style.display = 'none';
   }, 5000);
}

function addToPlaylist(song) {
   showSnackbar(song);
}

function filterSongs(inputValue, songs, songList, selectedFilter) {
   const filteredSongs = songs.filter(song => {
      let filterValue = '';

      if (selectedFilter == 'title') {
         filterValue = song[selectedFilter].toString().toLowerCase();
      } else if (selectedFilter == 'artist') {
         filterValue = song.artist.name.toString().toLowerCase();
      } else {
         filterValue = song.genre.name.toString().toLowerCase();
      }

      return filterValue.includes(inputValue.toLowerCase());
   });

   populateSearchView(filteredSongs, displaySongList(filteredSongs, songList));
}

function clearSongsFilter(songs, songList) {
   populateSearchView(songs, displaySongList(songs, songList));
}