/*
* our home js doc, meant to hold and handle those functions relating to presenting
* our homeview.
*/

/*
* shows our home view.
*/
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
 
 /*
 * calculates the top 15 of the passed selection; top 15 genre's, artists, or songs.
 * Also builds the html needed to present these top 15 lists.
 */
 function topOf(selection) {
    const searchView = document.querySelector('#searchView');
    const counts = numbersOf(selection);
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
          }
       });
       topList.appendChild(listItem);
    })
 }
 
 /*
 * creates and returns an array that contains a number of key-value pairs, where
 * each key is a genre/artist/song name and the value it is paired with is the number
 * of that selection present in our complete list of songs.
 */
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