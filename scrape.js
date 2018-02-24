var http = require('http'),
    stream = require('stream'),
    archiver = require('archiver');

exports.urlList = [];

var groupLink = /\\u.{4,4}[0-9]{0,4}\\u.{4,4}\$http:\/\/audio.xmcdn.com[a-zA-Z0-9/_-]{0,}.m4a\$mp3/g;
var titleLink = /\\u.{4,4}[0-9]{0,4}\\u.{4,4}/g;
var urlLink = /http:\/\/audio.xmcdn.com[a-zA-Z0-9/_-]{0,}.m4a/g;

exports.load = function(){
  return new Promise((resolve, reject) => {
    http.get('http://m.lanren9.com/video/2710-1-4.html', res => {
      var total = "";
      res.on('data', chunk=>{
        total+=chunk;
      });
      res.on('end', ()=>{
        console.log('Obtained base HTML');
        parse(total);
        resolve();
      })
    }).on('error', err=>{
      reject(err)
    })
  })
}

exports.scrape = function(ind1, ind2){
  var archive = archiver('zip', {
    zlib: {level: 9}
  });

  archive.on('warning', err=>{
    if (err.code === 'ENOENT') {
      // log warning
      console.log('ENOENT warning')
    } else {
      // throw error
      console.log('Warning error')
      throw err;
    }
  });
  archive.on('error', function(err) {
    throw err;
  });

  new Promise((resolve, reject) => {
    var count = 0;
    for(var i = ind1 ; i<=ind2; i++){
      count++
      console.log('Loading Archive for '+exports.urlList[i].title+" at "+exports.urlList[i].url);
      getm4a(exports.urlList[i].title, exports.urlList[i].url, archive).then(()=>{
        count--;
        console.log("Resolved")
        if(count==0){
          console.log('Requests Resolved')
          resolve();
        }
      })
    }
  }).then(()=>{
    archive.finalize();
  })
  return archive
}

function getm4a(name, link, arch){
  return new Promise((resolve, reject) => {
    http.get(link, res => {
      resolve();
      arch.append(res, {name: name+'.m4a'});
    }).on('error', err=>{
      console.log('error in getting m4a');
      reject(err);
    })
  })
}

function parse(html){
  var res = html.match(groupLink);
  res.forEach(result=>{
    var m1 = result.match(titleLink)[0];
    var m2 = result.match(urlLink)[0];
    if(m1!=undefined && m2!=undefined){
      var ep = {
        title: m1.replace('\\u7B2C', 'di').replace('\\u96C6', 'ji'),
        url: m2
      }
      exports.urlList.push(ep);
    }
  });
}

// exports.load().then(()=>{
//   exports.scrape(2,5);
// })

// http.get('http://audio.xmcdn.com/group16/M03/84/53/wKgDbFYd9S2hZnbtAI5oYmIjrIk939.m4a', res => {
//     //arch.append(res, {name: 'lmao.m4a'});
//     res.on('data', chunk=>{
//       console.log(chunk.length)
//     })
//     res.on('end', ()=>{
//       console.log('finished');
//     })
//   }).on('error', err=>{
//     console.log(err);
//   })