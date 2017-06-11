'use strict';

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const request = require('request');

const server = express();

server.use(logger('dev'));
server.use(bodyParser.json());

var cardsSend = [];

server.post('/hook', function(req, res) {
  console.log('hook request');
  try {
    if (req.body) {
      console.log(JSON.stringify(req));
      var requestBody = req.body;
      if (requestBody.result && requestBody.result.action && requestBody.result.action == 'getUserTopic') {
        getUserTopic(requestBody, function(result) {
          console.log('result: ', cardsSend);
          // user_id = requestBody.originalRequest.data.recipient.id;
          return res.json({
            speech: "",
            messages: cardsSend
            // displayText: "test response1",
            // source: 'dhanush-diana'
          });
        });
      }
    }
  } catch (err) {
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
  getQuizlets(requestBody.result.parameters.usertopic, callback);
}

function getQuizlets(usertopic, clbk) {
  var options1 = {
    url: "https://api.quizlet.com/2.0/search/sets?q=" + usertopic + "&client_id=DZH2jBMBKx"
  };

  function callback1(err, res, body) {
    if (!err && body) {
      var body = JSON.parse(body);
      console.log('body: ' + JSON.stringify(body));
      console.log('body.sets.length: ' + JSON.stringify(body.sets.length));
      var nSets = body.sets.length;
      var randNum = Math.floor(Math.random() * nSets);
      var chosenSetID = body.sets[randNum].id;
      console.log("chosenSetID: " + chosenSetID);

      var options2 = {
        url: "https://api.quizlet.com/2.0/sets/" + chosenSetID + "?client_id=DZH2jBMBKx&whitespace=1"
      };

      function callback2(err2, res2, body2) {
        if (!err2 && body2) {
          var body2 = JSON.parse(body2);
          console.log('body2: ' + JSON.stringify(body2));
          console.log('body2.terms.length: ' + JSON.stringify(body2.terms.length));
          //  var termNames = [];
          //  var defs = [];
          var nCards = body2.terms.length >= 10 ? 10 : body2.terms.length;
          cardsSend = [];
          for (var i = 0; i < nCards; i++) {
            if (body2.terms[i]) {
              var cardObj = {
                "type": 1,
                title: "",
                subtitle: "",
                image_url: "",
                buttons: [{
                  "type": "web_url",
                  "url": "github.com/Dhanush123",
                  "title": "More Info"
                }]
              };
              cardObj.title = body2.terms[i].term.substring(0, 80);
              cardObj.subtitle = body2.terms[i].definition.substring(0, 80);
              if (body2.terms[i].image) {
                cardObj.image_url = body2.terms[i].image.url;
              }
              cardsSend[i] = cardObj;
              console.log("cardsSend[" + i + "]" + JSON.stringify(cardsSend[i]));
            }
          }
          clbk();
        }
      }

      request(options2, callback2);
    }
  }

  request(options1, callback1);
}

//for reference: http://stackoverflow.com/questions/37960857/how-to-show-personalized-welcome-message-in-facebook-messenger?answertab=active#tab-top
function createGreetingApi(data) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
    qs: {
      access_token: 'EAAcnw2WC4OkBAF9TPesdvGZABoL4UoByGU9b9HKmASsTij09rxF3wJuNMwM74wLiwnzKVPhL7F3ffpE99TYmfyo7TPf9exUk1mPH2oOaVcGBPaxodrTDFkqS1GPZAvIeSnxZB6kfKTEBaWkmsYCYNndmtqbrJT1bMcMcypXAAZDZD'
    },
    method: 'POST',
    json: data

  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Greeting set successfully!");
      console.log(JSON.stringify(body));
    } else {
      console.error("Failed calling Thread Reference API", response.statusCode, response.statusMessage, body.error);
    }
  });
}

function setGreetingText() {
  var greetingData = {
    setting_type: "greeting",
    greeting: {
      text: "Hi {{user_first_name}}, welcome! You can ask to learn about any topic on the go!"
    }
  };
  createGreetingApi(greetingData);
}

server.listen((process.env.PORT || 8000), function() {
  console.log('Server listening');
  setGreetingText();
});
