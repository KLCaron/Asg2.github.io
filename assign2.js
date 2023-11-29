document.addEventListener('DOMContentLoaded', () => {
   //get references to my various elements
   const searchButton = document.querySelector('#searchButton');
   const playlistButton = document.querySelector('#playlistButton');
   const creditsButton = document.querySelector('#creditsButton');
   const homeView = document.querySelector('#homeView');
   const searchView = document.querySelector('#searchView');
   const logo = document.querySelector('#logo');

   retrieveStorage()
      .then(() => {
         showView(homeView, false);

         //fetch data from API to populate Home view on page load
      
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
            const creditsContent = '<p>Group Members: Kellen Caron, Mica Leviste</p><a href="https://github.com/KLCaron/Assignment-2">GitHub</a>';
            tooltipDisplay(event, creditsContent);
         });
      })
      .catch((error) => {
         console.error('Error retrieving stored data: ', error);
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

   view.style.display = 'flex';

   if (view == searchView) {
      showSearchView(redirect);
      setSongSearch();
   } else if (view == homeView) {
      showHomeView();
   } else {
      showSearchView(redirect);
      setSongSearch();
   }
}

function showSearchView(redirect) {
   const filterButton = document.querySelector('#filterButton');
   const clearButton = document.querySelector('#clearButton');
   const clearPlaylistButton = document.querySelector('#clearPlaylistButton');
   const playlistStats = document.querySelector('#playlistStats');
   const searchResultsHeader = document.querySelector('#searchResultsHeader');

   retrieveStorage()
      .then(() => {
         let mySongs;

         if (redirect) {
            searchResultsHeader.innerHTML = 'Playlist';
            mySongs = setPlaylistSongs(songs);
            clearPlaylistButton.style.display = 'block';
            clearPlaylistButton.addEventListener('click', () => {
               clearPlaylist();
               showSearchView(redirect);
               showSnackbar();
            });
            playlistStats.style.display = 'block';
            showplaylistStats();
         } else {
            searchResultsHeader.innerHTML = 'Search Results';
            mySongs = songs;
            clearPlaylistButton.style.display = 'none';
            playlistStats.style.display = 'none';
         }
      
         mySongs.sort((a, b) => a.title.localeCompare(b.title));
         const songList = document.querySelector('#songList');
         arraySongs(mySongs, displaySongList(mySongs, songList, redirect), redirect);
      
         filterButton.addEventListener('click', () => {
            const selectedFilter = document.querySelector(`input[name="filter"]:checked`).value;
            const filterInput = document.querySelector(`#${selectedFilter}Filter`);
            const inputValue = filterInput.value.trim();
            filterSongs(inputValue, mySongs, songList, selectedFilter, redirect);
         });
      
         clearButton.addEventListener('click', () => {
            clearSongsFilter(mySongs, songList, redirect);
         });
      })
      .catch((error) => {
         console.error('Error retrieving stored data: ', error);
      });
}

//fetch and store song data from our jsons
function fetchStoreData() {
   const api = 'https://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php';
   const fetchArtists = fetch('artists.json')
      .then(response => response.json())
      .then(data => {
         artists = data;
         localStorage.setItem('artists', JSON.stringify(data));
      })
      .catch(error => console.error('Error fetching artists.json:', error));

   const fetchGenres = fetch('genres.json')
      .then(response => response.json())
      .then(data => {
         genres = data;
         localStorage.setItem('genres', JSON.stringify(data));
      })
      .catch(error => console.error('Error fetching genres.json', error));

   const fetchSongs = fetch(api) //'api' goes here when done
      .then(response => response.json())
      .then(data => {
         songs = data;
         localStorage.setItem('songs', JSON.stringify(data));
      })
      .catch(error => console.error('Error fetching artists.json', error));

   return Promise.all([fetchArtists, fetchGenres, fetchSongs]);
}

//retrive data from local storage
function retrieveStorage() {
   return new Promise((resolve, reject) => {
      const localArtists = localStorage.getItem('artists');
      const localGenres = localStorage.getItem('genres');
      const localSongs = localStorage.getItem('songs');

      if (localArtists && localGenres && localSongs) {
         artists = JSON.parse(localArtists);
         genres = JSON.parse(localGenres);
         songs = JSON.parse(localSongs);
         resolve();
      } else {
         fetchStoreData()
            .then(() => {
               resolve();
            })
            .catch((error) => {
               reject(error);
            });
      }
   });
}

function displaySongList(songs, songList, redirect) {
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
         sortSongs(songs, event, songList, redirect);
      });
   });

   songList.appendChild(headerRow);
   return songList;
}

function arraySongs(songs, songList, redirect) {
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
            showSearchView(redirect);
         });
      } else {
         playlist.textContent = 'Add';
         playlist.addEventListener('click', () => {
            addToPlaylist(song);
            showSearchView(redirect);
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
         ellipsis.addEventListener('mouseover', (event) => {
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

function sortSongs(songs, event, songList, redirect) {
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
   arraySongs(songs, songList, redirect);
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
   snackbar.innerHTML = '';
   
   if (!song) {
      snackbar.innerHTML = "All songs removed from playlist.";
   } else if (!song.onPlaylist) {
      snackbar.innerHTML = song.title + " by " + song.artist.name + " removed from playlist.";
   } else {
      snackbar.innerHTML = song.title + " by " + song.artist.name + " added to playlist.";
   }

   const oldTimeout = snackbar.getAttribute('timeoutId');
   if (oldTimeout) {
      clearTimeout(oldTimeout);
   }

   snackbar.style.opacity = 1;
   const timeoutId = setTimeout(() => {
      snackbar.style.opacity = 0;
   }, 5000);

   snackbar.setAttribute('timeoutId', timeoutId);
}



function filterSongs(inputValue, songs, songList, selectedFilter, redirect) {
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

   arraySongs(filteredSongs, displaySongList(filteredSongs, songList, redirect), redirect);
}

function clearSongsFilter(songs, songList, redirect) {
   const titleInput = document.querySelector('#titleFilter');
   const genreInput = document.querySelector('#genreFilter');
   const artistInput = document.querySelector('#artistFilter');
   let refreshButton;

   if (redirect) {
      refreshButton = document.querySelector('#playlistButton');
   } else {
      refreshButton = document.querySelector('#searchButton');
   }
   
   titleInput.value = '';
   genreInput.value = '';
   artistInput.value = '';
   arraySongs(songs, displaySongList(songs, songList, redirect), redirect);
   refreshButton.click();
}

function updateSortIndicator(target) {
   const sortIndicator = parseInt(target.getAttribute('dataDirection'));

   target.classList.remove('up', 'down');

   if (sortIndicator == 0) {
      target.classList.add('up');
   } else {
      target.classList.add('down');
   }
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
         fill: true,
         backgroundColor: 'rgba(233,133,177, 0.5)',
         borderColor: 'rgb(233,133,177)',
         pointBackgroundColor: 'rgb(233,133,177)',
         pointBorderColor: 'rgb(233,133,177)',
         pointHoverBackgroundColor: 'rgb(251,255,254)',
         pointHoverBorderColor: 'rgb(233,133,177)',
         borderWidth: 1
      }]
   };

   const chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.5,
      scales: {
         r: {
            angleLines: {
              color: 'rgb(251,255,254)'
            },
            grid: {
              color: 'rgb(251,255,254)'
            },
            pointLabels: {
              color: 'rgb(251,255,254)'
            },
         },
         ticks: {
            color: 'rgb(29, 17, 40)',
            backdropColor: 'rgb(251,255,254, 0.2)',
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
            angleLines: {
               color: 'rgb(251,255,254)'
             },
             grid: {
               color: 'rgb(251,255,254)'
             },
            ticks: {
               callback: function(value, index, ticks) {
                  return value + '%';
               },
            },
            pointLabels: {
               color: 'rgb(251,255,254)',
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
   song.onPlaylist = true;
   localStorage.setItem('songs', JSON.stringify(songs));
   showSnackbar(song);
}

function removeFromPlaylist(song) {
   song.onPlaylist = false;
   localStorage.setItem('songs', JSON.stringify(songs));
   showSnackbar(song);
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

function clearPlaylist() {
   songs.forEach (song => {
      song.onPlaylist = false;
   });

   localStorage.setItem('songs', JSON.stringify(songs));
}

function showplaylistStats() {
   const content = document.querySelector('#playlistStatsContent');
   content.innerHTML = '';
   const songNumItem = document.createElement('li');
   const avgPopItem = document.createElement('li');
   songNumItem.classList.add('playlistItem');
   avgPopItem.classList.add('playlistItem');
   let avgPop = 0;
   let songNum = 0;

   songs.forEach (song => {
      if (song.onPlaylist) {
         songNum++;
         avgPop += song.details.popularity;
      }
   });

   if (avgPop != 0) {
      avgPop /= songNum;
      avgPop = avgPop.toFixed(1);
      avgPop = parseFloat(avgPop).toString();
   }

   songNumItem.innerHTML = `# of Songs in Playlist: ${songNum}`;
   avgPopItem.innerHTML = `Average Popularity of Playlist Songs: ${avgPop}`;

   content.appendChild(songNumItem);
   content.appendChild(avgPopItem);
}

//make new js docs at the end lmao
/******************************************************************************************************************************************/

function showHomeView() {
   retrieveStorage()
      .then(() => {
         topOf(genres);
         topOf(artists);
         topOf(songs);
      })
      .catch((error) => {
         console.error('Error retrieving stored data: ', error);
      });
}

function topOf(selection) {
   const searchView = document.querySelector('#searchView');
   const counts = numbersOf(selection);
   const filterButton = document.querySelector('#filterButton');
   const titleFilter = document.querySelector('#titleFilter');
   let topList;
   let source;
   let inputField;
   let inputRadio;

   if (selection == genres) {
      topList = document.querySelector(`#topGenresList`);
      inputField = document.querySelector('#genreFilter');
      inputRadio = document.querySelector('#genreRadio');
      source = 'genres';
   } else if (selection == artists) {
      topList = document.querySelector(`#topArtistsList`);
      inputField = document.querySelector('#artistFilter');
      inputRadio = document.querySelector('#artistRadio');
      source = 'artists';
   } else {
      topList = document.querySelector('#mostPopularSongsList')
      source = 'songs'
   }

   topList.innerHTML = '';

   const countArray = Object.entries(counts).map(([name, count]) => ({name, count}));
   countArray.sort((a, b) => b.count - a.count);

   const top15 = countArray.slice(0, 15);
   let matchingName;
   
   top15.forEach(entry => {
      const listItem = document.createElement('li');
      listItem.classList.add('topItem', 'selectable');
      listItem.textContent = entry.name;
      listItem.addEventListener('click', () => {
         if (source == 'songs') {
            matchingName = selection.find(song => song.title == entry.name);
            showSingleSongView(matchingName);
         } else {
            showView(searchView, false);
            inputField.disabled = false;
            titleFilter.disabled = true;
            inputField.value = entry.name;
            inputRadio.checked = true;
            filterButton.click();
         }
      });
      topList.appendChild(listItem);
   })
}

function numbersOf(selection) {
   const counts = {};
   let selectedName;

   if (selection == songs) {
      selection.forEach (selected => {
         counts[selected.title] = selected.details.popularity;
      });

      return counts;
   }

   selection.forEach (selected => {
      counts[selected.name] = 0;
   });   

   songs.forEach(song => {
      if (selection == genres) {
         selectedName = song.genre.name;
      } else {
         selectedName = song.artist.name;
      }
      if (counts.hasOwnProperty(selectedName)) {
         counts[selectedName]++;
      }
   });

   return counts;
}