/*
* our singlesong js doc, meant to hold and handle those functions relating to presenting
* our singlesong view, as well as the radar chart within.
*/

/*
* Shows our single song view; takes in the selected song, gets the chart set up
* for it, and loads up the song details.
*/
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

/*
* formats the duration of our song; from seconds, into minute:seconds. Adds
* a leading 0 to seconds when seconds is a single digit.
*/
function formatDuration(durationSeconds) {
    const minutes = Math.floor(durationSeconds / 60);
    let seconds = durationSeconds % 60;
    if (seconds < 10) {
       seconds = '0' + seconds;
    };
 
    return `${minutes}:${seconds}`;
 }
 
 /*
 * get's the given artist's type based on their name, returns unknown if not found.
 */
 function getArtistType(name) {
    const type = artists.find(artist => artist.name == name);
    return type ? type.type : 'Unknown';
}

/*
* create's our radar chart, populated with the given song's detials. The chart
* is also styled here.
*/
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