
let https = require('https')
// **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace the accessKey string value with your valid access key.
let accessKey = '53c0a59f48f34afd89a7ab5af6277117';

// Replace or verify the region.

// You must use the same region in your REST API call as you used to obtain your access keys.
// For example, if you obtained your access keys from the westus region, replace 
// "westcentralus" in the URI below with "westus".

// NOTE: Free trial access keys are generated in the westcentralus region, so if you are using
// a free trial access key, you should not need to change this region.
let uri = 'centralus.api.cognitive.microsoft.com';
let path = '/text/analytics/v2.0/keyPhrases';
let get_key_phrases = function (documents) {

    
    let temp = {"id":1,text:documents};
    let consutruted = { "documents":[temp]}

    let body = JSON.stringify (consutruted);

    let request_params = {
        method : 'POST',
        hostname : uri,
        path : path,
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
        }
    };
    console.log(request_params);
    let promise = new Promise((resolve,reject)=>{
        let req = https.request (request_params,(response)=>{
            var data = '';
            response.on('data',function(body){
                data+=body ;
            })
            response.on('end',()=>{ 
                jsonData = JSON.parse(data);
                keyWords = jsonData['documents'][0]['keyPhrases'];
                resolve(keyWords);
            });
            response.on('error',()=>{reject(response.statusCode+'');});
        });
        req.write(body);
        req.end();

    });
    return promise; 
}
module.exports.get_key_phrases = get_key_phrases
