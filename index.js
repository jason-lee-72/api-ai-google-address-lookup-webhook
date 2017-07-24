let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use('/webhook', (req, res) => {
  response = "This is a sample response from your webhook! action is " + req.body.result.action;


  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(JSON.stringify({
    "speech": response, "displayText": response
    //"speech" is the spoken version of the response, "displayText" is the visual version
  }));
});

app.use(function(req, res, next) {
    let err = new Error('Not Found');
    res.status = 404;
    next(err);
});

app.listen(port, function() {
    console.log('App listening at http://%s:%s', 'localhost', port);
});