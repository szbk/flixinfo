const GetFlix = require('../index');

const getflix = new GetFlix('d9d6007d1bcf12043db5a085ae3e5bbb');
const getInfo = async () => {
    try {
        const info = await getflix.get(80244780, 'tr-TR');
        // info.credits.cast.forEach((f) => console.log(f.profile_path));
        console.log(info);

    } catch (error) {
        console.log(error);
    }
}

getInfo();

