const request = require('superagent');
const retry   = require('../');

request
.get('/ip/all')
.use(retry(3))
.end(function(err, res){
  console.log(res.body);
});
