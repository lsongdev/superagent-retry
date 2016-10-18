const debug = require('debug');

/**
 * [retry description]
 * @param  {[type]} retries [description]
 * @return {[type]}         [description]
 */
function retry(retries, shouldRetry){
  function reset (request, timeout) {
    var headers = request.req._headers;
    var path = request.req.path;

    request.req.abort();
    request.called = false;
    request.timeout(timeout);
    delete request.req;
    delete request._timer;

    for (var k in headers) {
      request.set(k, headers[k]);
    }

    if (!request.qs) {
      request.req.path = path;
    }
  }
  shouldRetry = shouldRetry || function (err, res){
    return !!err;
  }
  return function(request){
    var end = request.end;
    request.end = function attemptRetry(fn){
      var timeout = request._timeout;
      end.call(request, function(err, res){
        if(retries && shouldRetry(err, res)){
          debug('superagent')('retrying ...', request.url);
          reset(request, timeout);
          attemptRetry(fn);
          retries--;
        }else{
          fn && fn.apply(request, arguments);
        }
      });
      return this;
    };
  }
}

module.exports = retry;
