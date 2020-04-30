// Dependencies
const cheerio = require('cheerio');
const request = require('request');
// Configs
const config = require('../config');

// imdb.com adresine bağlanarak imdb id'sinin geçerliliğini sorgulamayı sağlayan method
const getRealImdbId = (flixableFindImdbId) => {

  const imdbIdURL = "https://www.imdb.com/title/" + flixableFindImdbId

  return new Promise((resolve, reject) => {
    request(imdbIdURL, (error, response, body) => {
      if (error) {
        reject('imdb id alinirken hata olustu')
      } else {
        const $ = cheerio.load(body, {
          normalizeWhitespace: true,
          xmlMode: true
        });
        const imdbId = ($($('[property="pageId"]')).attr('content'));
        const imdbRate = /<span itemprop="ratingValue">(.*?)<\/span>/img.exec(body)[1]
        if (imdbId == undefined) {
          reject('imdb id bulunamadi')
        } else {
          resolve({
            id: imdbId,
            rate: imdbRate
          })
        }
      }
    })
  })
}

// The Movie DB Api'ye istek atar
const getTmdbDetails = (getParamaters, thmdbId, type, tmdbApiKey, language) => {
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

const setTmdbAllInfos = async (googleSearch, tmdbId, type, tmdbApiKey, theMovieDbLanguage) => {
  // Get detail info
  const details = await getTmdbDetails('details', tmdbId, type, tmdbApiKey, theMovieDbLanguage)
  // Get credits info
  const credits = await getTmdbDetails('credits', tmdbId, type, tmdbApiKey)
  // Get images info
  const images = await getTmdbDetails('images', tmdbId, type, tmdbApiKey)
  // Get trailers
  const trailers = await getTmdbDetails('trailers', tmdbId, type, tmdbApiKey)

  return { google_search: googleSearch, details, credits, images, trailers }
}

// Tmdb Api'de title ve year bilgilerine göre yapılan aramada sonuç bulunamazsa, netflixTitle, netflixYear, netflixCast 
// bilgileri ile google'da arama yapar. Bu arama sonucunda tmdb id bilgisine ulaşır.
const searchGoogleForTmdbId = (type, netflixTitle, netflixYear, netflixCast, theMovieDbLanguage, tmdbApiKey) => {

  return new Promise((resolve, reject) => {

    const searchUrl = "https://www.google.com/search?q=" + netflixTitle + " " + netflixYear + " " + netflixCast[0] + " " + "themoviedb.org&ie=UTF-8"

    request(encodeURI(searchUrl), async (error, response, body) => {

      if (body) {
        const $ = cheerio.load(body, {
          normalizeWhitespace: true,
          xmlMode: true
        });

        try {

          const tmdbIdFind = (/\/url\?q\=https\:\/\/www.themoviedb.org\/(.*?)&/img.exec(body)[1]).split("/")[1]
          const tmdbId = /\d+/g.exec(tmdbIdFind)[0]

          // tmdb info ayarlandı
          resolve(await setTmdbAllInfos(true, tmdbId, type, tmdbApiKey, theMovieDbLanguage))

        } catch (error) {
          reject('themoviedb id not found')
        }
      } else {
        // google arama sonucu hatalıysa
        reject('themoviedb id not found')
      }
    })
  })
}

module.exports = { getTmdbDetails, getRealImdbId, setTmdbAllInfos, searchGoogleForTmdbId }