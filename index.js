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

function lookupAddress(res, addressToLookup) {
  var googleMapsClient = require('@google/maps').createClient({
    key: require('./config/google-maps').api_key
  });

  googleMapsClient.geocode({
    address: addressToLookup
  }, function (err, response) {
    if (!err) {
      const formattedAddress = response.json.results[0].formatted_address;
      fireEvent(res,
        'google-address-lookup-complete',
        {
          "formatted-address": response.json.results[0].formatted_address
        });
    } else {
      fireEvent(res,
        'google-address-lookup-failed',
        {
          "message": res.json.message
        });
    }
  });
}

app.use('/webhook', (req, res) => {
  res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  //response = "This is a sample response from your webhook! action is " + req.body.result.action;

  switch (req.body.result.action) {
    case 'google-address-lookup':
      const addressToLookup = req.body.result.parameters['address-to-lookup'];
      if (addressToLookup) {
        lookupAddress(res, addressToLookup);
        break;
      }
    case 'fire-event':
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