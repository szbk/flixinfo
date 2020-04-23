const config = require('../config');
const request = require('request');

module.exports.getDetails = function (detailsId, movieOrTv, tmdbApiKey, language, cb) {

  if (movieOrTv == 'movie' || movieOrTv == 'tv') {

    const detailURL = config.theMovieDbURL + movieOrTv + '/' + detailsId + '?api_key=' + tmdbApiKey + '&language=' + language;

    request(detailURL, (err, resultBody, body) => {
      if (resultBody != '') {
        const getJson = JSON.parse(resultBody.body);

        if (getJson.status_code > 1) {
          // if wrong api key error
          const error = 'tmdb get detail wrong api key error';
          const result = null;
          cb(error, result);
        }
        else {
          if (err) {
            // if thmdb api connection error
            const error = 'tmdb get detail api connection error';
            const result = null;
            cb(error, result);
          }
          else {
            const error = null;
            const result = getJson;
            cb(error, result);
          }
        }
      } else {
        const error = 'tmdb get detail api connection error';
        const result = null;
        cb(error, result);
      }
    });
  }
  else {
    const error = 'tmdb get detail wrong watch parameter';
    const result = null;
    cb(error, result);
  }
}

module.exports.getCredits = function (detailsId, movieOrTv, tmdbApiKey, cb) {

  if (movieOrTv == 'movie' || movieOrTv == 'tv') {

    const creditsURL = config.theMovieDbURL + movieOrTv + '/' + detailsId + '/credits?api_key=' + tmdbApiKey + '&language=en-US';

    request(creditsURL, (err, resultBody, body) => {

      const getJson = JSON.parse(resultBody.body);

      if (getJson.status_code > 1) {
        // if wrong api key error
        const error = 'tmdb get credits wrong api key error';
        const result = null;
        cb(error, result);
      }
      else {
        if (err) {
          // if thmdb api connection error
          const error = 'tmdb get credits api connection error';
          const result = null;
          cb(error, result);
        }
        else {
          const error = null;
          const result = getJson;
          cb(error, result);
        }
      }

    });
  }
  else {
    const error = 'tmdb get credits wrong watch parameter';
    const result = null;
    cb(error, result);
  }
}

module.exports.getTrailers = function (detailsId, movieOrTv, tmdbApiKey, cb) {

  if (movieOrTv == 'movie' || movieOrTv == 'tv') {

    // https://api.themoviedb.org/3/movie/157336/videos?api_key=API-KEY
    const trailersURL = config.theMovieDbURL + movieOrTv + '/' + detailsId + '/videos?api_key=' + tmdbApiKey;

    request(trailersURL, (err, resultBody, body) => {

      const getJson = JSON.parse(resultBody.body);

      if (getJson.status_code > 1) {
        // if wrong api key error
        const error = 'tmdb get credits wrong api key error';
        const result = null;
        cb(error, result);
      }
      else {
        if (err) {
          // if thmdb api connection error
          const error = 'tmdb get trailers api connection error';
          const result = null;
          cb(error, result);
        }
        else {
          const error = null;
          const result = getJson;

          cb(error, result);
        }
      }

    });
  }
  else {
    const error = 'tmdb get trailers wrong watch parameter';
    const result = null;
    cb(error, result);
  }
}

module.exports.getImages = function (detailsId, movieOrTv, tmdbApiKey, cb) {

  if (movieOrTv == 'movie' || movieOrTv == 'tv') {

    const creditsURL = config.theMovieDbURL + movieOrTv + '/' + detailsId + '/images?api_key=' + tmdbApiKey + '&language=en-US&include_image_language=en,null';

    request(creditsURL, (err, resultBody, body) => {

      if (resultBody != []) {
        const getJson = JSON.parse(resultBody.body);
        if (getJson.status_code > 1) {
          // if wrong api key error
          const error = 'tmdb get images wrong api key error';
          const result = null;
          cb(error, result);
        }
        else {
          if (err) {
            // if thmdb api connection error
            const error = 'tmdb get images api connection error';
            const result = null;
            cb(error, result);
          }
          else {
            const error = null;
            const result = getJson;
            cb(error, result);
          }
        }
      } else {
        // if wrong api key error
        const error = 'error getting data';
        const result = null;
        cb(error, result);
      }
    });
  }
  else {
    const error = 'tmdb get images wrong watch parameter';
    const result = null;
    cb(error, result);
  }
}
