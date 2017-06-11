'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const server = express();
server.use(bodyParser.json());

server.post('/hook', function (req, res) {
  console.log('hook request');
  try {

      if (req.body) {
          var requestBody = req.body;
          if (requestBody.result) {
            if (requestBody.result.action == 'getUserTopic') {
              getLastCityQuake(requestBody,function(result) {
                console.log('result: ', speech);
                return res.json({
                  speech: "test response1",
                  displayText: "test response1",
                  source: 'dhanush-quakey'
                });
              });
            }
          }
      }
  }
  catch (err) {
    console.error('Cannot process request', err);
    return res.status(400).json({
        status: {
            code: 400,
            errorType: err.message
        }
    });
  }
});

function getUserTopic(requestBody, callback) {
  console.log('requestBody: ' + JSON.stringify(requestBody));
      callback();
}

//for reference: http://stackoverflow.com/questions/37960857/how-to-show-personalized-welcome-message-in-facebook-messenger?answertab=active#tab-top
function createGreetingApi(data) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
    qs: { access_token: 'EAAcnw2WC4OkBAF9TPesdvGZABoL4UoByGU9b9HKmASsTij09rxF3wJuNMwM74wLiwnzKVPhL7F3ffpE99TYmfyo7TPf9exUk1mPH2oOaVcGBPaxodrTDFkqS1GPZAvIeSnxZB6kfKTEBaWkmsYCYNndmtqbrJT1bMcMcypXAAZDZD' },
    method: 'POST',
    json: data

    }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Greeting set successfully!");
    } else {
      console.error("Failed calling Thread Reference API", response.statusCode, response.statusMessage, body.error);
    }
  });
}

function setGreetingText() {
  var greetingData = {
    setting_type: "greeting",
    greeting:{
      text:"Hi {{user_first_name}}, welcome! You can ask to learn about any topic on the go!"
    }
  };
  createGreetingApi(greetingData);
}

server.listen((process.env.PORT || 8000), function () {
  console.log('Server listening');
  setGreetingText();
});
