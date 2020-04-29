const GetFlix = require('../index');
const getflix = new GetFlix('d9d6007d1bcf12043db5a085ae3e5bbb');

getInfo = async () => {
    try {
        const info = await getflix.getNetflixInfo(81082225, 'en-EN', 'en');
        console.log(info);
    } catch (error) {
        console.log(error);
    }
}

getInfo();

