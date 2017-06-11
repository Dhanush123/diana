'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const server = express();
server.use(bodyParser.json());

var cardsSend = [];

server.post('/hook', function (req, res) {
  console.log('hook request');
  try {

      if (req.body) {
          var requestBody = req.body;
          if (requestBody.result) {
            if (requestBody.result.action == 'getUserTopic') {
              getUserTopic(requestBody,function(result) {
                console.log('result: ', "test response1");
                return res.json({
                      attachment: {
                          type: "template",
                          payload: {
                              template_type: "generic",
                              elements: cardsSend
                            }
                          }
                        });

                // return res.json({
                //   speech: "test response1",
                //   displayText: "test response1",
                //   source: 'dhanush-diana'
                // });
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
  getQuizlets(requestBody.result.parameters.usertopic,callback);
}

function getQuizlets(usertopic, clbk){
  var options = {
    url: "https://api.quizlet.com/2.0/search/sets?q="+usertopic+"&client_id=DZH2jBMBKx"
  };
  function callback(err,res,body){
    if(!err && body){
      var nSets = body.sets.length;
      var randNum = Math.floor(Math.random() * nSets);
      var chosenSetID = body.sets[randNum].id;

      var options = {
        url: "https://api.quizlet.com/2.0/sets/"+chosenSetID+"?client_id=DZH2jBMBKx&whitespace=1"
      };
      function callback2(err2,res2,body2){
        if(!err2 && body2){
        //  var termNames = [];
        //  var defs = [];
         var nCards = terms.length > 10 ? 10 : terms.length;
         for(var i = 0; i < nCards; i++){
           var cardObj = {
                title: "",
                subtitle: "",
                "type": 1
           };
           cardObj.title = terms[i].term;
           cardObj.subtitle = terms[i].definition;
         }
         clbk();
        }
      }
      request(options2,callback2);
    }
  }
  request(options,callback);
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
