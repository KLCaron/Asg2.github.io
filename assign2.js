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
   const homeView = document.querySelector('#homeView');
   const searchView = document.querySelector('#searchView');
   const logo = document.querySelector('#logo');

   showView(homeView, false);

   //fetch data from API to populate Home view on page load
   window.addEventListener('load', () => {
      retrieveStorage();
   });

   logo.addEventListener('click', () => {
      showView(homeView, false);
   });

   searchButton.addEventListener('click', () => {
      showView(searchView, false);
   });

   playlistButton.addEventListener('click', () => {
      showView(searchView, true);
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
function showView(view, redirect) {
   //hide all views
   const views = document.querySelectorAll('.view');
   views.forEach(view => {
      view.style.display = 'none';
   });

   view.style.display = 'block';

   if (view == searchView) {
      showSearchView(redirect);
      setSongSearch();
   } else if (view == homeView) {
      view.style.display = 'none';
   } else if (redirect) {
      showSearchView(redirect);
      setSongSearch();
   }
}

function showSearchView(redirect) {
   const filterButton = document.querySelector('#filterButton');
   const clearButton = document.querySelector('#clearButton')

   retrieveStorage();

   let mySongs;

   if (redirect) {
      mySongs = setPlaylistSongs(songs);
   } else {
      mySongs = songs;
   }

   mySongs.sort((a, b) => a.title.localeCompare(b.title));
   const songList = document.querySelector('#songList');
   arraySongs(mySongs, displaySongList(mySongs, songList));

   filterButton.addEventListener('click', () => {
      const selectedFilter = document.querySelector(`input[name="filter"]:checked`).value;
      const filterInput = document.querySelector(`#${selectedFilter}Filter`);
      const inputValue = filterInput.value.trim();
      filterSongs(inputValue, mySongs, songList, selectedFilter);
   });

   clearButton.addEventListener('click', () => {
      clearSongsFilter(mySongs, songList);
   });
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
      headerItem.classList.add('sortable');
      headerItem.classList.add('selectable');
      headerItem.innerHTML = `${title}<span class="sortIndicator"></span>`;
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
      if (song.onPlaylist) {
         playlist.textContent = 'Remove';
         playlist.addEventListener('click', () => {
            removeFromPlaylist(song);
            arraySongs(songs, songList);
         });
      } else {
         playlist.textContent = 'Add';
         playlist.addEventListener('click', () => {
            addToPlaylist(song);
            arraySongs(songs, songList);
         });
      }

      const title = document.createElement('span');
      title.classList.add('selectable');
      title.textContent = song.title.length > 25 ? song.title.slice(0, 24) : song.title;
      
      title.addEventListener('click', () => {
         showSingleSongView(song);
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
   updateSortIndicator(event.target);

   event.target.setAttribute('dataDirection', direction == 0 ? 1 : 0);
   arraySongs(songs, songList);
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
   if (song.onPlaylist) {
      snackbar.innerHTML = song.title + " by " + song.artist.name + " removed from playlist.";
   } else {
      snackbar.innerHTML = song.title + " by " + song.artist.name + " added to playlist.";
   }
   
   setTimeout(() => {
      snackbar.style.display = 'none';
   }, 5000);
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

   arraySongs(filteredSongs, displaySongList(filteredSongs, songList));
}

function clearSongsFilter(songs, songList) {
   arraySongs(songs, displaySongList(songs, songList));
}

function updateSortIndicator(target) {
   const sortIndicator = parseInt(target.getAttribute('dataDirection'));

   target.classList.remove('up', 'down');

   if (sortIndicator == 0) {
      target.classList.add('up');
   } else {
      target.classList.add('down');
   }
   console.log(target.classList);
}

//make new js docs at the end lmao
/******************************************************************************************************************************************/

function showSingleSongView(song) {
   const views = document.querySelectorAll('.view');
   views.forEach(view => {
      view.style.display = 'none';
   });
   const view = document.querySelector('#singleSongView');
   view.style.display = 'block';

   const radarChartCanvas = document.querySelector('#radarChart');

   const oldchart = Chart.getChart(radarChartCanvas);

   if (oldchart) {
      oldchart.destroy();
   }

   const songInformation = document.querySelector('#songInformation');
   songInformation.innerHTML = '';

   const radarChartContainer = document.querySelector('#chart');
   const formattedDuration = formatDuration(song.details.duration);
   const artistType = getArtistType(song.artist.name)
   const songDetailsHTML = `
   <h2>${song.title}</h2>
   <p>Artist: ${song.artist.name}</p>
   <p>Artist Type: ${artistType}</p>
   <p>Genre: ${song.genre.name}</p>
   <p>Year: ${song.year}</p>
   <p>Duration: ${formattedDuration}</p>`;
   const analysisData = `
   <h3>Analysis Data: </h3>
   <ul>
   <li>BPM: ${song.details.bpm}</li>
   <li>Energy: ${song.analytics.energy}</li>
   <li>Danceability: ${song.analytics.danceability}</li>
   <li>Liveness: ${song.analytics.liveness}</li>
   <li>Valence: ${song.analytics.valence}</li>
   <li>Acousticness: ${song.analytics.acousticness}</li>
   <li>Speechiness: ${song.analytics.speechiness}</li>
   <li>Popularity: ${song.details.popularity}</li>
   </ul>`;

   songInformation.innerHTML = songDetailsHTML + analysisData;
   radarChartContainer.appendChild(radarChartCanvas);

   createRadarChart(song);
}

function formatDuration(durationSeconds) {
   const minutes = Math.floor(durationSeconds / 60);
   let seconds = durationSeconds % 60;
   if (seconds < 10) {
      seconds = '0' + seconds;
   };

   return `${minutes}:${seconds}`;
}

function getArtistType(name) {
   const type = artists.find(artist => artist.name == name);
   return type ? type.type : 'Unknown';
}

function createRadarChart(song) {
   const radarChartCanvas = document.querySelector('#radarChart');

   const chartData = {
      label: false,
      labels: ['Energy', 'Danceability', 'Valence', 'Liveness', 'Acousticness', 
         'Speechiness'],
      datasets: [{
         labels: ['Energy', 'Danceability', 'Valence', 'Liveness', 'Acousticness', 
         'Speechiness'],
         data: [song.analytics.energy, song.analytics.danceability, 
         song.analytics.valence, song.analytics.liveness, song.analytics.acousticness, 
         song.analytics.speechiness],
         borderColor: 'black',
         borderWidth: 1
      }]
   };

   const chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.5,
      scale: {
         ticks: {
            beginAtZero: true,
            min: 0,
            max: 100,
            stepSize: 20,
            font: {
               weight: 'bold',
               size: 14,
            },
         },
      },
      scales: {
         r: {
            ticks: {
               callback: function(value, index, ticks) {
                  return value + '%';
               },
            },
            pointLabels: {
               font: {
                  weight: 'bold',
                  size: 20,
               },
            },
         },
      },
      plugins: {
         legend: {
            display: false
         },
         tooltip: {
            callbacks: {
               label: function (tooltipItem) {
                  const yLabel = tooltipItem.formattedValue;
                  return yLabel + '%';
               },
            },
         },
      },
   };

   return new Chart(radarChartCanvas, {
      type: 'radar',
      data: chartData,
      options: chartOptions
   });
}

//make new js docs at the end lmao
/******************************************************************************************************************************************/

function addToPlaylist(song) {
   showSnackbar(song);
   song.onPlaylist = true;

   localStorage.setItem('songs', JSON.stringify(songs));
}

function removeFromPlaylist(song) {
   showSnackbar(song);
   song.onPlaylist = false;

   localStorage.setItem('songs', JSON.stringify(songs));
}

function setPlaylistSongs(songs) {
   let playlistSongs = [];
   songs.forEach (song => {
      if (song.onPlaylist) {
         playlistSongs.push(song);
      }
   });

   return playlistSongs;
}

//still need to finish playlist - need a way to clear playlist, and then summary information about the playlist, like average popularity, or number of songs
//in list