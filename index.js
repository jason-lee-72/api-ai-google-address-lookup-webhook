let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

function fireEvent(res, eventName, dataObj) {
  res.json({
    "followupEvent": {
      "name": eventName,
      "data": dataObj
    }
  });
}

function lookup(req, res) {
  var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyAsg_hoH1HVXONJhwUwR6f2fGZROJQwM1E'
  });

  googleMapsClient.geocode({
    address: req.body.result.parameters['pre-validation-address']
  }, function (err, response) {

    if (!err) {
      const validatedAddress = response.json.results[0].formatted_address;
      fireEvent(res,
        'lookupComplete',
        {
          "post-validation-address": response.json.results[0].formatted_address
        });
    } else {
      res.status(500);
      res.send(err.json.error_message);
    }
  });
}

app.use('/webhook', (req, res) => {
  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  //response = "This is a sample response from your webhook! action is " + req.body.result.action;

  switch (req.body.result.action) {
    case 'googleAddressLookup':
      lookup(req, res);
      break;
    case 'fireEvent':
      const eventName = req.body.result.parameters['event-name'];
      if (eventName) {
        fireEvent(res, eventName, {});
        break;
      }
    default:
      res.status(501);
      res.end();
  }
});

app.use(function (req, res, next) {
  let err = new Error('Not Found');
  res.status = 404;
  next(err);
});

app.listen(port, function () {
  console.log('App listening at http://%s:%s', 'localhost', port);
});