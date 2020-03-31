const GetFlix = require('../index');

const getflix = new GetFlix('YOUR API KEY');
const getInfo = async () => {
    try {
        const info = await getflix.get(80241239, 'en-EN');
        console.log(info);

    } catch (error) {
        console.log(error);
    }
}

getInfo();

