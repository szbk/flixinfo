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

                flixinfoWrongApiKey.getInfo(70143836)
                    .catch(result => {
                        result.should.have.property('error').equal(1);
                        result.should.have.property('errorMsg').equal('tmdb find id wrong api key error');
                        done();
                    })

            });
        });
    });

    describe('#getInfo()', () => {

        const flixinfo = new GetFlix('d9d6007d1bcf12043db5a085ae3e5bbb');

        context('Return result infos', () => {
            // Movie test
            it('- movies return right result', (done) => {
                flixinfo.getInfo(70131314)
                    .then(result => {
                        result.should.have.property('result').equal(1);
                        result.should.have.property('error').equal(0);
                        result.should.have.property('details').have.property('original_title').equal('Inception');
                        result.should.have.property('details').have.property('title').equal('Inception');
                        result.should.have.property('details').have.property('release_date').equal('2010-07-15');
                        result.should.have.property('details').have.property('poster_path').equal('/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg');
                        result.should.have.property('details').have.property('backdrop_path').equal('/s2bT29y0ngXxxu2IA8AOzzXTRhd.jpg');
                        result.should.have.property('details').have.property('id').equal(27205);
                        result.should.have.property('details').have.property('imdb_id').equal('tt1375666');
                        result.should.have.property('details').have.property('original_language').equal('en');
                        result.should.have.property('credits').have.property('id').equal(27205);
                        result.should.have.property('images').have.property('id').equal(27205);
                        done();
                    })
            });
            // // Tv test
            it('- tv series return right result', (done) => {
                flixinfo.getInfo(80232926)
                    .then(result => {
                        result.should.have.property('result').equal(1);
                        result.should.have.property('error').equal(0);
                        result.should.have.property('details').have.property('original_name').equal('Ragnarok');
                        result.should.have.property('details').have.property('name').equal('Ragnarok');
                        result.should.have.property('details').have.property('first_air_date').equal('2020-01-31');
                        result.should.have.property('details').have.property('poster_path').equal('/bSXE4qqdWWFF903FmxSdKtVRm7t.jpg');
                        result.should.have.property('details').have.property('backdrop_path').equal('/jM7LHr811U4A6EnY9iMyKhUVsMN.jpg');
                        result.should.have.property('details').have.property('id').equal(91557);
                        result.should.have.property('details').have.property('original_language').equal('no');
                        result.should.have.property('credits').have.property('id').equal(91557);
                        result.should.have.property('images').have.property('id').equal(91557);
                        done();
                    });
            });

            it('- return empty result', (done) => {
                flixinfo.getInfo(70143836)
                    .then(result => {
                        result.should.have.property('error').equal(0);
                        done();
                    });
            });
            it('- flixable.com and tmdb.com connection error', (done) => {
                nock.disableNetConnect(); //Prevents making request external connection
                flixinfo.getInfo(70143836)
                    .catch(result => {
                        result.should.have.property('error').equal(1);
                        result.should.have.property('errorMsg');
                        done();
                    });
            });
        });
    });
});