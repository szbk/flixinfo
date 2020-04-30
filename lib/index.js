// Dependencies
const cheerio = require('cheerio');
const request = require('request');
// Config
const config = require('../config');
// Modules
const modules = require('./module');

class FlixInfo {

  /**
  * Get movie/show info
  * @param {string} tmdbApiKey The Movie DB Api ye ait key girilir
  * @description Netflix içeriğine ulaşmayı sağlayan sınıf
 */
  constructor(opt = '') {
    if (opt == '') throw new Error('missing tmdb api key');

    this.tmdbApiKey = opt;
  }

  /**
   * Get movie/show info
   * @param {number} netflixId Aranan netflix içeriğine ait id bilgisi girilir
   * @param {string} theMovieDbLanguage The Movie DB Api de hangi dilde arama yapılacağı girilir (e.g. tr-TR)
   * @param {string} netflixLocation flixinfo üzerinde hangi lokasyonda sorgulama yapılacağı girilir (e.g. tr -> tr.flixinfo.com)
   * @description Netflix içeriğinde id bilgisine ve netflix lokasyonuna göre arama yapmayı sağlar
  */
  getNetflixInfo(netflixId, theMovieDbLanguage, netflixLocation) {

    // Imdb id page
    const flixableURL = netflixLocation == 'tr' ? (config.filexibleTrURL + netflixId) : (config.filexibleGlobalURL + netflixId);
    // The Movie DB api page
    const theMovieDbURL = config.theMovieDbURL;
    // API Key
    const tmdbApiKey = this.tmdbApiKey;
    // Result Object
    let returnResult = {};

    return new Promise((resolve, reject) => {

      request(encodeURI(flixableURL), async (err, response, body) => {
        if (err) {
          reject('flixable.com connection error: ' + err.message);
        }
        else {
          if (body) {
            const $ = cheerio.load(body, {
              normalizeWhitespace: true,
              xmlMode: true
            });

            let netflixButton = null;

            try {
              // netflix butonu varsa içerik bulunuyordur.
              netflixButton = /class=\"btn btn-danger btn-block watch-on-service\"(.*?)/img.exec(body)[0];
            } catch (error) {
              reject('this content was not found!')
            }

            if (netflixButton != null) {

              let imdbId = null
              let imdbRate = null
              let netflixSeasonNumber = null
              let netflixRuntime = null
              let tmdbURL, netflixTitle
              // flixable'da bulunan imdb id (bu id değişmiş olabileceğinden imdb.com üzerinden kontrol ediliyor)
              const findFlixableImdbId = ($($('[class="mb-2 rating-container"]')).attr()) ? ($($('[class="imdbRatingPlugin"]')).attr('data-title')) : null;
              // media type (movie or tv show)
              const type = netflixLocation == 'tr' ? (body.search("Sezon") > 0 ? 'tv' : 'movie') : (body.search("Season") > 0 ? 'tv' : 'movie');
              // netflix üzerindeki overview bilgisi
              const netflixOverview = ($($('[name="description"]')).attr('content'));
              // netlflix üzerindeki poster url
              const netflixPosterUrl = ($($('[class="img lazyload poster"]')).attr('data-src'));
              // netflix üzerindeki age rate bilgisi
              const netflixAgeRates = /<span class="border border-secondary mr-2 px-1">(.*?)<\/span>/img.exec(body)[1]
              // find title
              const findTitle = ($($('[property="og:title"]')).attr('content'));
              const splitString = findTitle.split("- Netflix");
              // netflix title
              netflixTitle = splitString[0].split("(")[0].trim();
              // netflix year
              const netflixYear = splitString[0].split("(")[1].split(")")[0].trim();
              // type tv ise sezon sayısını, movie ise filmin süresini ayarlar
              if (type == 'tv') {
                netflixSeasonNumber = (/<\/span><span>(.*?)<\/h6>/img.exec(body)[1]).split('</span> ')[0]
              } else {
                netflixRuntime = (/<\/span><span>(.*?)<\/h6>/img.exec(body)[1]).split('</span> ')[0]
              }
              // genre ayarlar
              let netflixGenres = []
              const netflixGenresFind = body.match(/<a href="\/genre\/(.*?)<\/a>/img)
              if (netflixGenresFind) {
                netflixGenresFind.forEach((genre) => {
                  netflixGenres.push((/\/">(.*?)<\/a>/img).exec(genre)[1])
                })
              }
              // actor name ayarlar
              let netflixCast = []
              const netflixActorNamesFind = body.match(/<a href="\/actor\/\?name=(.*?)<\/a>/img)
              if (netflixActorNamesFind) {
                netflixActorNamesFind.forEach((actors) => {
                  netflixCast.push((/\">(.*?)<\/a>/img).exec(actors)[1])
                })
              }

              if (theMovieDbLanguage) {
                // Sayfada imdb id varsa, tmdb üzerinden imdb id'ye göre arama yapılır
                if (findFlixableImdbId) {
                  const imdb = await modules.getRealImdbId(findFlixableImdbId)
                  imdbId = imdb.id
                  imdbRate = imdb.rate
                  tmdbURL = theMovieDbURL + 'find/' + imdbId + '?api_key=' + tmdbApiKey + '&language=' + theMovieDbLanguage + '&external_source=imdb_id';
                }
                else {
                  // Sayfada imdb id yoksa, tmdb üzerinden title ve year'a göre arama yapılır
                  tmdbURL = theMovieDbURL + 'search/' + type + '?api_key=' + tmdbApiKey + '&language=' + theMovieDbLanguage + '&query=' + netflixTitle + '&first_air_date_year=' + netflixYear;
                }
                
                request(encodeURI(tmdbURL), async (err, resultBody, body) => {

                  if (err) {
                    // if thmdb api connection error
                    reject('tmdb api find id connection error: ' + err.message)
                  } else {

                    if (resultBody) {
                      // Api find all result (for get tmdb id)
                      const getJson = JSON.parse(resultBody.body);

                      if (getJson.status_code > 1) {
                        // if wrong api key error
                        reject('tmdb find id wrong api key error')
                      }
                      else {

                        let result;

                        if (imdbId) {
                          result = type == 'movie' ? getJson.movie_results : getJson.tv_results
                        } else {
                          result = getJson.results
                        }

                        // if tmdb api result not empty
                        if (result.length) {

                          const tmdbId = result[0].id;

                          try {
                            // set tmdb info
                            const { google_search, details, credits, images, trailers } = await modules.setTmdbAllInfos(false, tmdbId, type, tmdbApiKey, theMovieDbLanguage)

                            // Result Object
                            result = {
                              result: 1,
                              error: 0,
                              watch: type,
                              imdb: {
                                // imdb üzerinden id alınamadıysa tmdb üzerinden alınmaya çalışılır. tmdb'de de yoksa null döner
                                id: (imdbId != null ? imdbId : (details.imdb_id != undefined ? details.imdb_id : null)),
                                rate: imdbRate
                              },
                              netflix: {
                                title: netflixTitle,
                                year: netflixYear,
                                poster_url: netflixPosterUrl,
                                age_rates: netflixAgeRates,
                                season: netflixSeasonNumber,
                                runtime: netflixRuntime,
                                overview: netflixOverview,
                                genres: netflixGenres,
                                cast: netflixCast
                              },
                              tmdb: {
                                google_search,
                                details,
                                credits,
                                images,
                                trailers
                              }
                            };
                            resolve(result);
                          } catch (error) {
                            reject('tmdb bilgileri alinirken hata olustu: ' + error);
                          }
                        }
                        else {
                          let tmdbInfo = null
                          // Imdb id verisi yoksa (title ve year bilgisine göre arama yapılmışsa) ve Oyuncu bilgisi varsa google ile arama yap
                          // Oyuncu bilgisi yoksa arama yapılmaz ve tmdb null olarak döner
                          if (!findFlixableImdbId && netflixCast != []) {
                            try {
                              // google arama sonucu veri döndüyse tmdb infoyu doldur
                              tmdbInfo = await modules.searchGoogleForTmdbId(type, netflixTitle, netflixYear, netflixCast, theMovieDbLanguage, tmdbApiKey)
                            } catch (error) {
                              // console.log('Google Search Warning: ' + error);
                            }
                          }

                          // Tmdb verisi yoksa sadece netflix verisi döndür
                          result = {
                            result: 1,
                            error: 0,
                            watch: type,
                            imdb: {
                              id: imdbId,
                              rate: imdbRate
                            },
                            netflix: {
                              title: netflixTitle,
                              year: netflixYear,
                              age_rates: netflixAgeRates,
                              season: netflixSeasonNumber,
                              runtime: netflixRuntime,
                              overview: netflixOverview,
                              genres: netflixGenres,
                              cast: netflixCast
                            },
                            tmdb: tmdbInfo
                          };
                          resolve(result);
                        }
                      }
                    } else {
                      // thmdb verisi hatalı döndüyse
                      reject('tmdb api result.body hatalı döndü')
                    }
                  }
                });
              } else {
                // language bilgisi hatalı
                reject('language parameters not found')
              }
            }
            else {
              // Return the empty result if imdb id cannot be found
              reject('imdb id cannot be found')
            }
          } else {
            reject('netflix verileri alınamadı')
          }
        }
      });
    });
  }
}
module.exports = FlixInfo;
