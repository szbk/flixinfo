const GetFlix = require('../index');

try {
    const getflix = new GetFlix('f29e56ff85f361ff01b5c5403a343021');
    getflix.getInfo('80040119', (res) => {
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
