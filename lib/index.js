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


          let netflixButton = null;

          try {
            netflixButton = /class=\"btn btn-danger btn-block watch-on-service\"(.*?)/img.exec(body)[0];
          } catch (error) {
            returnResult = { error: 1, errorMsg: 'this content was not found!' };
            reject(returnResult)
          }


          if (netflixButton != null) {

            const findTitle = ($($('[property="og:title"]')).attr('content'));
            const splitString = findTitle.split("-");
            const title = splitString[0].split("(")[0].trim();
            const year = splitString[0].split("(")[1].split(")")[0].trim();
            const type = body.search("Sezon") > 0 ? 'tv' : 'movie';
            const netflixOverview = ($($('[name="description"]')).attr('content'));
            const netflixPoster = ($($('[class="img lazyload poster"]')).attr('data-src'));


            if (language) {
              // create (find) tmdb api url
              const tmdbURL = theMovieDbURL + 'search/' + type + '?api_key=' + tmdbApiKey + '&language=' + language + '&query=' + title + '&first_air_date_year=' + year;
              
              request(encodeURI(tmdbURL), (err, resultBody, body) => {
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
                    if (getJson.results.length) {

                      const thmdbId = getJson.results[0].id;

                      // Get detail info
                      modules.getDetails(thmdbId, type, tmdbApiKey, language, (err, getDetailResult) => {

                        if (err) {
                          returnResult = { error: 1, errorMsg: err };
                          reject(returnResult);
                        }
                        else {
                          // Get credits info
                          modules.getCredits(thmdbId, type, tmdbApiKey, (err, getCreditsResult) => {
                            if (err) {
                              returnResult = { error: 1, errorMsg: err };
                              reject(returnResult);
                            }
                            else {
                              // Get images info
                              modules.getImages(thmdbId, type, tmdbApiKey, (err, getImagesResult) => {
                                if (err) {
                                  returnResult = { error: 1, errorMsg: err };
                                  reject(returnResult);
                                }
                                else {
                                  modules.getTrailers(thmdbId, type, tmdbApiKey, (err, getTrailersResult) => {
                                    if (err) {
                                      returnResult = { error: 1, errorMsg: err };
                                      reject(returnResult);
                                    } else {
                                      getDetailResult.netflix_overview = netflixOverview;
                                      getDetailResult.netflix_poster = netflixPoster;
                                      returnResult = { result: 1, error: 0, watch: type, details: getDetailResult, credits: getCreditsResult, images: getImagesResult, trailers: getTrailersResult };
                                      resolve(returnResult);
                                    }
                                  });
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
              returnResult = { error: 1, errorMsg: 'anguage parameters not found.' };
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
