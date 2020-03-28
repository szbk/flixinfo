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

  /**
   * Get movie/show info
   * @param {number} netflixId
   * @return {JSON}
  */
  get(netflixId, language) {

    // Imdb id page
    const flixableURL = config.filexibleURL + netflixId;

    // The Movie DB api page
    const theMovieDbURL = config.theMovieDbURL;
    // API Key
    const tmdbApiKey = this.tmdbApiKey;
    // Result Object
    var returnResult = {};

    return new Promise((resolve, reject) => {

      request(flixableURL, (err, response, body) => {
        if (err) {
          returnResult = { error: 1, errorMsg: 'flixable.com connection error' };
          reject(returnResult);
        }
        else {
          const $ = cheerio.load(body, {
            normalizeWhitespace: true,
            xmlMode: true
          });

          const imdbResult = $('[class="imdbRatingPlugin"]').length;
          let netflixButton = null;

          try {
            netflixButton = /class=\"btn btn-primary watch-on-netflix\"(.*?)/img.exec(body)[0];
          } catch (error) {
            returnResult = { error: 1, errorMsg: 'this content was not found!' };
            reject(returnResult)
          }


          if (netflixButton != null) {
            const imdbId = ($($('[class="imdbRatingPlugin"]')).attr('data-title'));

            if (imdbId && language) {
              // create (find) tmdb api url
              const tmdbURL = theMovieDbURL + 'find/' + imdbId + '?api_key=' + tmdbApiKey + '&language=' + language + '&external_source=imdb_id';

              request(tmdbURL, (err, resultBody, body) => {
                // Api find all result (for get tmdb id)
                const getJson = JSON.parse(resultBody.body);
                
                if (getJson.status_code > 1) {
                  // if wrong api key error
                  returnResult = { error: 1, errorMsg: 'tmdb find id wrong api key error' };
                  reject(returnResult)
                }
                else {

                  if (err) {
                    // if thmdb api connection error
                    returnResult = { error: 1, errorMsg: 'tmdb find id connection api error' };
                    reject(returnResult)
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
                      modules.getDetails(thmdbId, watchParameter, tmdbApiKey, language,(err, getDetailResult) => {
                        
                        if (err) {
                          returnResult = { error: 1, errorMsg: err };
                          reject(returnResult);
                        }
                        else {
                          // Get credits info
                          modules.getCredits(thmdbId, watchParameter, tmdbApiKey, (err, getCreditsResult) => {
                            if (err) {
                              returnResult = { error: 1, errorMsg: err };
                              reject(returnResult);
                            }
                            else {
                              // Get images info
                              modules.getImages(thmdbId, watchParameter, tmdbApiKey, (err, getImagesResult) => {
                                if (err) {
                                  returnResult = { error: 1, errorMsg: err };
                                  reject(returnResult);
                                }
                                else {
                                  returnResult = { result: 1, error: 0, watch: watchParameter, details: getDetailResult, credits: getCreditsResult, images: getImagesResult };
                                  resolve(returnResult);
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                    else {
                      // Return the empty result if tmdb return empty
                      const returnResult = { result: 0, error: 0, msg: 'tmdb api return is empty' };
                      reject(returnResult)
                    }
                  }
                }
              });
            } else {
              returnResult = { error: 1, errorMsg: 'imdb id or language parameters not found.' };
              reject(returnResult)
            }
          }
          else {
            // Return the empty result if imdb id cannot be found
            const returnResult = { result: 0, error: 0, msg: 'imdb id cannot be found' };
            reject(returnResult)
          }
        }
      });
    });
  }
}
module.exports = FlixInfo;
