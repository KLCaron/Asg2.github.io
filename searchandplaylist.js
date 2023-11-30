/*
* our searchview and playlistview js doc, meant to hold functions more specifically designed for
* our search and playlist view's.
*/

/*
* Initializes and sets to default our various song searching filters.
*/
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

/*
* Initializes and sets up our search and playlist views; the view in question is
* determined by the redirect flag - false for search, true for playlist.
*/
function showSearchOrPlaylistView(redirect) {
    const filterButton = document.querySelector('#filterButton');
    const clearButton = document.querySelector('#clearButton');
    const clearPlaylistButton = document.querySelector('#clearPlaylistButton');
    const playlistStats = document.querySelector('#playlistStats');
    const searchResultsHeader = document.querySelector('#searchResultsHeader');
    const titleRadio = document.querySelector('#titleRadio');
 
    retrieveStorage()
       .then(() => {
          let mySongs;
 
          if (redirect) {
             searchResultsHeader.innerHTML = 'Playlist';
             mySongs = setPlaylistSongs(songs);
             clearPlaylistButton.style.display = 'block';
             clearPlaylistButton.addEventListener('click', () => {
                clearPlaylist();
                showSearchOrPlaylistView(redirect);
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
          displaySongList(mySongs, displaySongListTitles(mySongs, songList, redirect), redirect);
       
          filterButton.addEventListener('click', () => {
            const selectedFilter = document.querySelector(`input[name="filter"]:checked`).value;
            const filterInput = document.querySelector(`#${selectedFilter}Filter`);
            const inputValue = filterInput.value.trim();
            filterSongs(inputValue, mySongs, songList, selectedFilter, redirect);
          });

          //if we came from homeview, we apply filter immediately
          if (!titleRadio.checked) {
            filterButton.click();
          }
       
          clearButton.addEventListener('click', () => {
             clearSongsFilter(mySongs, songList, redirect);
          });
       })
       .catch((error) => {
          console.error('Error retrieving stored data: ', error);
       });
 }

/*
* For search and playlist view, this creates the header row for our ul table,
* and attaches the appropriate sorting indicators and event listeners.
*/
function displaySongListTitles(songs, songList, redirect) {
    songList.innerHTML = '';
 
    const headerRow = document.createElement('li');
    headerRow.classList.add('headerRow');
 
    const playlistPlaceholder = document.createElement('span');
    headerRow.appendChild(playlistPlaceholder);
 
    const headerTitles = ['Title', 'Artist', 'Year', 'Genre', 'Popularity'];
    headerTitles.forEach(title => {
       const headerItem = document.createElement('span');
       headerItem.classList.add('headerTitles');
       headerItem.classList.add('sortable');
       headerItem.classList.add('selectable');

       if (title === 'Title') {
         headerItem.classList.add('titleHeader'); // Add a class specifically for the 'Title' header
      }

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

/*
* For search and playlist view, creates li items that contain all of our songs.
* takes in the songlist first made in displaySongListTitles and attaches to it.
*/
function displaySongList(songs, songList, redirect) {
    const existingSongItems = songList.querySelectorAll('.songItem');
    existingSongItems.forEach(item => item.remove());
 
    songs.forEach(song => {
       const listItem = document.createElement('li');
       listItem.classList.add('songItem');

      // Create the button container
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('buttonContainer');
 
       const playlist = document.createElement('button');
       playlist.classList.add('selectable');
       if (song.onPlaylist) {
          playlist.textContent = 'Remove';
          playlist.classList.add('removeButton');
          playlist.addEventListener('click', () => {
             removeFromPlaylist(song);
             showSearchOrPlaylistView(redirect);
          });
       } else {
          playlist.textContent = 'Add';
          playlist.classList.add('addButton');
          playlist.addEventListener('click', () => {
             addToPlaylist(song);
             showSearchOrPlaylistView(redirect);
          });
       }

       buttonContainer.appendChild(playlist);
 
       const title = document.createElement('span');
       title.classList.add('selectable');
       title.classList.add('songTitles');
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
       
       buttonContainer.appendChild(playlist);
       listItem.appendChild(playlist);
       listItem.appendChild(title);
       listItem.appendChild(artist);
       listItem.appendChild(year);
       listItem.appendChild(genre);
       listItem.appendChild(popularity);
 
       songList.appendChild(listItem);
    });
}

/*
* Sorts our songs along the passed parameter, in standard order and in reverse depending on
* the dataDirection attribute that was attached to our songListTitles.
*/
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
    displaySongList(songs, songList, redirect);
}

/*
* filters through our song list based on the entered title, artist, or genre. Partial
* entries are accepted and parsed for all fields.
*/
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
 
    displaySongList(filteredSongs, displaySongListTitles(filteredSongs, songList, redirect), redirect);
}

/*
* clears all applied filters, both those typed as well as any kind of sorting applied.
* sets us back to default, the songs/playlist in full, sorted alphabetically by song title.
*/
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
    displaySongList(songs, displaySongListTitles(songs, songList, redirect), redirect);
    refreshButton.click();
}

/*
* updates the sort indicator next to our list titles, to indicate whether we're sorting
* positively or negatively.
*/
function updateSortIndicator(target) {
    const sortIndicator = parseInt(target.getAttribute('dataDirection'));
 
    target.classList.remove('up', 'down');
 
    if (sortIndicator == 0) {
       target.classList.add('up');
    } else {
       target.classList.add('down');
    }
}

/*
* adds the selected song to our playlist, updates local storage for immediate effect,
* and shows the appropriate snackbar.
*/
function addToPlaylist(song) { 
    song.onPlaylist = true;
    localStorage.setItem('songs', JSON.stringify(songs));
    showSnackbar(song);
 }
 
 /*
 * removes the selected song to our playlist, updates local storage for immediate effect,
 * and shows the appropriate snackbar.
 */
 function removeFromPlaylist(song) {
    song.onPlaylist = false;
    localStorage.setItem('songs', JSON.stringify(songs));
    showSnackbar(song);
}

/*
* called in showSearchOrPlaylistView to create the songs array used for populating our
* playlist, as opposed to our search. Any song item that was tagged as on the playlist
* is added.
*/
function setPlaylistSongs(songs) {
    let playlistSongs = [];
    songs.forEach (song => {
       if (song.onPlaylist) {
          playlistSongs.push(song);
       }
    });
 
    return playlistSongs;
 }
 
 /*
 * clear's our playlist of all songs, and updates localstorage for immediate
 * effect.
 */
 function clearPlaylist() {
    songs.forEach (song => {
       song.onPlaylist = false;
    });
 
    localStorage.setItem('songs', JSON.stringify(songs));
 }
 
 /*
 * calcualtes and presents our playlist stats; how many songs are on the list,
 * and what the average popularity of our lists songs are.
 */
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