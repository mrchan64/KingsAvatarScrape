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
  res.set('Content-Type', 'application/zip');
  res.set('Content-Disposition', 'attachment; filename=audioDownload.zip');
  console.log('Piping zip from '+req.query.start+" to " +req.query.end);
  scrape.scrape(parseInt(req.query.start),parseInt(req.query.end)).pipe(res);
})

var server = http.createServer(app);
server.listen(3000);