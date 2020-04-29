const config = require('../config');
const request = require('request');

module.exports.getTmdbDetails = function (getParamaters, thmdbId, type, tmdbApiKey, language) {
  return new Promise((resolve, reject) => {

    if (type == 'movie' || type == 'tv') {

      let url

      switch (getParamaters) {
        case 'details':
          url = config.theMovieDbURL + type + '/' + thmdbId + '?api_key=' + tmdbApiKey + '&language=' + language;
          break;
        case 'credits':
          url = config.theMovieDbURL + type + '/' + thmdbId + '/credits?api_key=' + tmdbApiKey + '&language=en-US';
          break;
        case 'trailers':
          url = config.theMovieDbURL + type + '/' + thmdbId + '/videos?api_key=' + tmdbApiKey;
          break;
        case 'images':
          url = config.theMovieDbURL + type + '/' + thmdbId + '/images?api_key=' + tmdbApiKey + '&language=en-US&include_image_language=en,null';
          break;
      }

      request(encodeURI(url), (err, resultBody, body) => {

        if (err) {
          // if thmdb api connection error
          reject('tmdb get detail api connection error');
        }
        else {
          if (resultBody != '') {
            const getJson = JSON.parse(resultBody.body);

            if (getJson.status_code > 1) {
              // if wrong api key error
              reject('tmdb get detail wrong api key error');
            }
            else {
              resolve(getJson);
            }
          } else {
            // request sonucu boş dönmüşse null döndür
            resolve(null)
          }
        }
      });
    }
    else {
      reject('tmdb get detail wrong watch parameter');
    }
  })
}