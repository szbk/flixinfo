const GetFlix = require('../index');
const getflix = new GetFlix({ tmdbApiKey: 'f29e56ff85f361ff01b5c5403a343021' });

try {
    getflix.getInfo('70143836', (res) => {
        if (res.error) {
            console.log(res.errorMsg);
        }
        else {
            console.log(res);
        }
    })
}
catch (error) {
    console.log(error.message)
}

