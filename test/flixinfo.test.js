const chai = require('chai');
const expect = chai.expect;
const config = require('../config');
const GetFlix = require('../index');
const nock = require('nock');
let should = chai.should();

describe('Flix Info', () => {

    describe('#constructor()', () => {

        context('Api Key is empty', () => {
            it('- throw an error', () => {
                expect(() => { new GetFlix(''); })
                    .to.throw('missing tmdb api key');
            });
        });

        context('Api Key is wrong', () => {
            it('- wrong tmdb api key error', (done) => {

                const flixinfoWrongApiKey = new GetFlix('sfs345k34jlkdflgkjdfglk435j345klj');

                flixinfoWrongApiKey.getInfo(70143836, (result) => {
                    result.should.have.property('error').equal(1);
                    result.should.have.property('errorMsg').equal('tmdb find id wrong api key error');
                    done();
                });
            });
        });
    });

    describe('#getInfo()', () => {

        const flixinfo = new GetFlix('f29e56ff85f361ff01b5c5403a343021');

        context('Return result infos', () => {
            // Movie test
            it('- movies return right result', (done) => {
                flixinfo.getInfo(60033299, (result) => {
                    result.should.have.property('result').equal(1);
                    result.should.have.property('error').equal(0);
                    result.should.have.property('details').have.property('original_title').equal('The Butterfly Effect');
                    result.should.have.property('details').have.property('title').equal('The Butterfly Effect');
                    result.should.have.property('details').have.property('release_date').equal('2004-01-22');
                    result.should.have.property('details').have.property('poster_path').equal('/3PAQy3CyNNJPES772OFMx47lFEE.jpg');
                    result.should.have.property('details').have.property('backdrop_path').equal('/zXTUrm0BIrrZn3nEhybg0hlY275.jpg');
                    result.should.have.property('details').have.property('id').equal(1954);
                    result.should.have.property('details').have.property('imdb_id').equal('tt0289879');
                    result.should.have.property('details').have.property('original_language').equal('en');
                    result.should.have.property('credits').have.property('id').equal(1954);
                    result.should.have.property('images').have.property('id').equal(1954);
                    done();
                });
            });
            // Tv test
            it('- tv series return right result', (done) => {
                flixinfo.getInfo(80099656, (result) => {
                    result.should.have.property('result').equal(1);
                    result.should.have.property('error').equal(0);
                    result.should.have.property('details').have.property('original_name').equal('Frontier');
                    result.should.have.property('details').have.property('name').equal('Frontier');
                    result.should.have.property('details').have.property('first_air_date').equal('2016-11-06');
                    result.should.have.property('details').have.property('poster_path').equal('/mhIeCeYgG4WJHNzaw2EyRpvmGX8.jpg');
                    result.should.have.property('details').have.property('backdrop_path').equal('/hDYEGNX6CADoCqhyBbe2Qu7rKVG.jpg');
                    result.should.have.property('details').have.property('id').equal(64555);
                    result.should.have.property('details').have.property('original_language').equal('en');
                    result.should.have.property('credits').have.property('id').equal(64555);
                    result.should.have.property('images').have.property('id').equal(64555);
                    done();
                });
            });

            it('- return empty result', (done) => {
                flixinfo.getInfo(23424, (result) => {
                    result.should.have.property('error').equal(0);
                    done();
                });
            });
            it('- flixable.com and tmdb.com connection error', (done) => {
                nock.disableNetConnect(); //Prevents making request external connection
                flixinfo.getInfo(70143836, (result) => {
                    result.should.have.property('error').equal(1);
                    result.should.have.property('errorMsg');
                    done();
                });
            });
        });
    });
});