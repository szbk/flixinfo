const GetFlix = require('../index');

const getflix = new GetFlix({tmdbApiKey : 'f29e56ff85f361ff01b5c5403a343021'});

getflix.getInfo('70143836', (err, res)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log(res);
    }
})

