// Depend
const cheerio = require('cheerio');
const request = require('request');

class FlixInfo {

  constructor(options = {}) {
    if (!options.tmdbApiKey) throw new Error('Missing tmdb api key');

    this.tmdbApiKey = options.tmdbApiKey;
  }

  getInfo(netflixId, cb) {

    // Imdb id page
    const flixableURL = 'https://flixable.com/title/' + netflixId;
    // The Movie DB api page
    const theMovieDbURL = 'https://api.themoviedb.org/3/find/';
    // API Key
    const tmdbApiKey = this.tmdbApiKey;

    var returnResult = {};

    request(flixableURL, (err, response, body) => {

      if (err) {
        returnResult = { error: 0, errorMsg: 'flixable.com request error details: ' + err };
        cb(returnResult)
      }
      else {
        const $ = cheerio.load(body, {
          normalizeWhitespace: true,
          xmlMode: true
        });

        const imdbResult = $('[class="imdbRatingPlugin"]').length;

        if (imdbResult) {
          $('[class="imdbRatingPlugin"]').each(function (i, element) {

            const imdbId = $(this).attr('data-title');
            const tmdbURL = theMovieDbURL + imdbId + '?api_key=' + tmdbApiKey + '&language=en-EN&external_source=imdb_id'

            request(tmdbURL, (err, resultBody, body) => {

              if (err) {
                returnResult = { error: 0, errorMsg: 'tmdb api request error details: ' + err };
                cb(returnResult)
              }
              else {
                // Result convert the json
                const getJson = JSON.parse(resultBody.body);

                if (getJson.tv_results.length) {
                  // If result is tv
                  var result = getJson.tv_results[0];
                  var originalName = result.original_name;
                  var name = result.name;
                  var year = result.first_air_date;
                  if (result.poster_path != null) {
                    var poster = 'https://image.tmdb.org/t/p/original/' + result.poster_path;
                  }
                  if (result.poster_path != null) {
                    var backdrop = 'https://image.tmdb.org/t/p/original/' + result.backdrop_path;
                  }
                  var country = result.origin_country[0];
                  var rate = result.vote_average;
                  var overviewEN = result.overview;

                }
                else if (getJson.movie_results.length) {
                  // If result is movie
                  var result = getJson.movie_results[0];
                  var originalName = result.original_title;
                  var name = result.title;
                  var year = result.release_date;
                  if (result.poster_path != null) {
                    var poster = 'https://image.tmdb.org/t/p/original/' + result.poster_path;
                  }
                  if (result.poster_path != null) {
                    var backdrop = 'https://image.tmdb.org/t/p/original/' + result.backdrop_path;
                  }
                  var country = result.original_language;
                  var rate = result.vote_average;
                  var overviewEN = result.overview;
                }

                returnResult = { result: 1, error: 0, originalName, name, year, poster, backdrop, country, rate, overviewEN };
                // If there is no error return the result
                cb(returnResult);
              }
            });
          })
        }
        else {
          // Return the error if imdb id cannot be found
          const returnResult = { result: 0, error: 0 };
          cb(returnResult)
        }
      }
    });
  }
}
module.exports = FlixInfo;
