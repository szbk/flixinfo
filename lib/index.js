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


  getNetflixInfo(netflixId) {

    const flixableUrl = config.filexibleTrURL + netflixId

    return new Promise((resolve, reject) => {
      request(flixableUrl, (error, response, body) => {

        const $ = cheerio.load(body, {
          normalizeWhitespace: true,
          xmlMode: true
        });

        const findImdb = ($($('[class="mb-2 rating-container"]')).attr()) ? ($($('[class="imdbRatingPlugin"]')).attr('data-title')) : null;

        if (findImdb) {
          request(("https://www.imdb.com/title/" + findImdb), (error, response, body) => {
            const $ = cheerio.load(body, {
              normalizeWhitespace: true,
              xmlMode: true
            });
            const imdbCleanId = ($($('[property="pageId"]')).attr('content'));
            console.log(imdbCleanId);
          })
        }
      })
    })
  }

  /**
   * Get movie/show info
   * @param {number} netflixId Aranan netflix içeriğine ait id bilgisi girilir
   * @param {string} theMovieDbLanguage The Movie DB Api de hangi dilde arama yapılacağı girilir (e.g. tr-TR)
   * @param {string} netflixLocation flixinfo üzerinde hangi lokasyonda sorgulama yapılacağı girilir (e.g. tr -> tr.flixinfo.com)
   * @description Netflix içeriğinde id bilgisine ve netflix lokasyonuna göre arama yapmayı sağlar
   * @return {JSON}
  */
  get(netflixId, theMovieDbLanguage, netflixLocation) {

    // Imdb id page
    const flixableURL = netflixLocation == 'tr' ? (config.filexibleTrURL + netflixId) : (config.filexibleGlobalURL + netflixId);

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


            const findImdb = ($($('[class="mb-2 rating-container"]')).attr());
            const type = netflixLocation == 'tr' ? (body.search("Sezon") > 0 ? 'tv' : 'movie') : (body.search("Season") > 0 ? 'tv' : 'movie');
            const netflixOverview = ($($('[name="description"]')).attr('content'));
            const netflixPoster = ($($('[class="img lazyload poster"]')).attr('data-src'));
            let tmdbURL
            let title

            if (theMovieDbLanguage) {

              // Sayfada imdb id varsa, tmdb üzerinden imdb id'ye göre arama yapılır
              if (findImdb) {
                const imdbId = ($($('[class="imdbRatingPlugin"]')).attr('data-title'));
                tmdbURL = theMovieDbURL + 'find/' + imdbId + '?api_key=' + tmdbApiKey + '&language=' + theMovieDbLanguage + '&external_source=imdb_id';
              }
              // Sayfada imdb id yoksa, tmdb üzerinden title ve year'a göre arama yapılır
              else {
                const findTitle = ($($('[property="og:title"]')).attr('content'));
                const splitString = findTitle.split("- Netflix");
                title = splitString[0].split("(")[0].trim();
                const year = splitString[0].split("(")[1].split(")")[0].trim();
                // create (find) tmdb api url
                tmdbURL = theMovieDbURL + 'search/' + type + '?api_key=' + tmdbApiKey + '&language=' + theMovieDbLanguage + '&query=' + title + '&first_air_date_year=' + year;
              }

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

                    let result;

                    if (findImdb) {
                      result = type == 'movie' ? getJson.movie_results : getJson.tv_results

                    } else {
                      result = getJson.results
                    }

                    // if tmdb api result not empty
                    if (result.length) {

                      const thmdbId = result[0].id;

                      // Get detail info
                      modules.getDetails(thmdbId, type, tmdbApiKey, theMovieDbLanguage, (err, getDetailResult) => {

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
                                      getDetailResult.netflix_title = title;
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
                      const returnResult = { result: 0, error: 1, msg: 'tmdb api return is empty' };
                      reject(returnResult)
                    }
                  }
                }
              });
            } else {
              returnResult = { error: 1, errorMsg: 'language parameters not found.' };
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
