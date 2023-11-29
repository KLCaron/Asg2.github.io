/*
* Our 'main' js file, contains more generic and unafilliated functions as well as
* our DOM event listener, functioning as our main().
*/

//wait for DOMContent to load before we do anything
document.addEventListener('DOMContentLoaded', () => {

   const searchButton = document.querySelector('#searchButton');
   const playlistButton = document.querySelector('#playlistButton');
   const creditsButton = document.querySelector('#creditsButton');
   const homeView = document.querySelector('#homeView');
   const searchView = document.querySelector('#searchView');
   const logo = document.querySelector('#logo');

   /*
   * check storage for json content, if it isn't there we fetch it; after,
   * we launch our initiall view, and set attach event listeners to our 
   * selectable buttons/logo. True or false here is for our playlist flag;
   * our search and playlist view are the same view, with minor differences
   * determined by the flag.
   */
   retrieveStorage()
      .then(() => {

         showView(homeView, false);
      
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

/*
* Hides existing view and swaps to passed in view.
*/
function showView(view, redirect) {

   const views = document.querySelectorAll('.view');
   views.forEach(view => {
      view.style.display = 'none';
   });

   view.style.display = 'flex';

   if (view == searchView) {
      showSearchOrPlaylistView(redirect);
      setSongSearch();
   } else if (view == homeView) {
      showHomeView();
   } else {
      showSearchOrPlaylistView(redirect);
      setSongSearch();
   }
}

/*
* fetch and store song data from our jsons/api. Returns a promise to retrieveStorage,
* to ensure full and proper completion before anything else can occur.
*/
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

   const fetchSongs = fetch(api)
      .then(response => response.json())
      .then(data => {
         songs = data;
         localStorage.setItem('songs', JSON.stringify(data));
      })
      .catch(error => console.error('Error fetching artists.json', error));

   return Promise.all([fetchArtists, fetchGenres, fetchSongs]);
}

/*
* Retrive data from local storage; if it isn't there, we fetch it fromm our api
* and jsons.
*/
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

/*
* Creates a tooltip at the mouse, dynamically positoned 
* based on where in the screen the mouse is. Times out after 5 seconds.
*/
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

/*
* shows a snackbar with relevant details on the passed song; was it added, or removed
* from the playlist, or was the playlist just cleared. Times out after 5 seconds.
*/
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