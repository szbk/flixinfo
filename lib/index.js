// Dependencies
const cheerio = require('cheerio');
const request = require('request');
// Config
const config = require('../config');
// Modules
const modules = require('./module');

class FlixInfo {

  constructor(opt = '') {
    if (opt == '') throw new Error('missing tmdb api key');

    this.tmdbApiKey = opt;
  }

  getInfo(netflixId, cb) {

    // Imdb id page
    const flixableURL = config.filexibleURL + netflixId;
    // The Movie DB api page
    const theMovieDbURL = config.theMovieDbURL;
    // API Key
    const tmdbApiKey = this.tmdbApiKey;
    // Result Object
    var returnResult = {};

    request(flixableURL, (err, response, body) => {
      if (err) {
        returnResult = { error: 1, errorMsg: 'flixable.com connection error' };
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

            // find imdb id attribute and catch
            const imdbId = $(this).attr('data-title');
            // create (find) tmdb api url
            const tmdbURL = theMovieDbURL + 'find/' + imdbId + '?api_key=' + tmdbApiKey + '&language=en-EN&external_source=imdb_id'
            
            request(tmdbURL, (err, resultBody, body) => {
              // Api find all result (for get tmdb id)
              const getJson = JSON.parse(resultBody.body);
              if (getJson.status_code > 1) {
                // if wrong api key error
                returnResult = { error: 1, errorMsg: 'tmdb find id wrong api key error' };
                cb(returnResult)
              }
              else {

                if (err) {
                  // if thmdb api connection error
                  returnResult = { error: 1, errorMsg: 'tmdb find id connection api error' };
                  cb(returnResult)
                }
                else {
                  
                  // if tmdb api result not empty
                  if (getJson.tv_results.length || getJson.movie_results.length) {
                    
                    if (getJson.movie_results.length) {
                      var watchParameter = 'movie';
                      var thmdbId = getJson.movie_results[0].id;
                    }
                    else if (getJson.tv_results.length) {
                      var watchParameter = 'tv';
                      var thmdbId = getJson.tv_results[0].id;
                    }
                    // Get detail info
                    modules.getDetails(thmdbId, watchParameter, tmdbApiKey, (err, getDetailResult) => {
                      if (err) {
                        returnResult = { error: 1, errorMsg: err };
                        cb(returnResult);
                      }
                      else {
                        // Get credits info
                        modules.getCredits(thmdbId, watchParameter, tmdbApiKey, (err, getCreditsResult) => {
                          if (err) {
                            returnResult = { error: 1, errorMsg: err };
                            cb(returnResult);
                          }
                          else {
                            // Get images info
                            modules.getImages(thmdbId, watchParameter, tmdbApiKey, (err, getImagesResult) => {
                              if (err) {
                                returnResult = { error: 1, errorMsg: err };
                                cb(returnResult);
                              }
                              else {
                                returnResult = { result: 1, error: 0, watch: watchParameter, details: getDetailResult, credits: getCreditsResult, images: getImagesResult };
                                cb(returnResult);
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                  else {
                    // Return the empty result if tmdb return empty
                    const returnResult = { result: 0, error: 0, msg: 'tmdb api return is empty'};
                    cb(returnResult)
                  }
                }
              }
            });
          })
        }
        else {
          // Return the empty result if imdb id cannot be found
          const returnResult = { result: 0, error: 0, msg: 'imdb id cannot be found' };
          cb(returnResult)
        }
      }
    });
  }
}
module.exports = FlixInfo;
