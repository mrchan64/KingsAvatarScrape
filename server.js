var express = require('express'),
    http = require('http'),
    scrape = require('./scrape');

var app = express()
var load = scrape.load();
var ready = false;
load.then(()=>{
  ready = true;
});

app.get('/', (req, res)=>{
  res.sendFile(__dirname+'/index.html');
})

app.get('/audio', (req, res)=>{
  if(!ready){
    res.send('not loaded');
    return;
  }

  var start = parseInt(req.query.start)-1;
  var end = parseInt(req.query.end)-1;
  if(0<=start && 0<=end && start<=end){
    res.send('invalid');
    return;
  }
  res.set('Content-Type', 'application/zip');
  res.set('Content-Disposition', 'attachment; filename=audioDownload.zip');
  console.log('Piping zip from '+start+" to " +end);
  scrape.scrape(start,end).pipe(res);
})

var server = http.createServer(app);
server.listen(process.env.PORT || 3000);