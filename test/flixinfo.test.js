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
                    result.should.have.property('errorMsg').equal('tmdb wrong api key error');
                    done();
                });
            });
        });
    });

    describe('#getInfo()', () => {

        const flixinfo = new GetFlix('f29e56ff85f361ff01b5c5403a343021');

        context('Return result infos', () => {
            it('- return right result', (done) => {
                flixinfo.getInfo(70143836, (result) => {
                    result.should.have.property('result').equal(1);
                    result.should.have.property('error').equal(0);
                    result.should.have.property('originalName').equal('Breaking Bad');
                    result.should.have.property('name').equal('Breaking Bad');
                    result.should.have.property('year').equal('2008-01-20');
                    result.should.have.property('poster').equal('https://image.tmdb.org/t/p/original//1yeVJox3rjo2jBKrrihIMj7uoS9.jpg');
                    result.should.have.property('backdrop').equal('https://image.tmdb.org/t/p/original//eSzpy96DwBujGFj0xMbXBcGcfxX.jpg');
                    result.should.have.property('country').equal('US');
                    result.should.have.property('rate').to.not.be.null
                    result.should.have.property('overviewEN').to.not.be.null
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