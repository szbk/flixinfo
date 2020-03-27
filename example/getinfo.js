const GetFlix = require('../index');

const getflix = new GetFlix('d9d6007d1bcf12043db5a085ae3e5bbb');
const getInfo = async () => {
    try {
        const info = await getflix.getInfo('802329261');
        if(info == null) {
            console.log('null');
            
        }

    } catch (error) {
        // console.log(error);
    }
}

getInfo();

