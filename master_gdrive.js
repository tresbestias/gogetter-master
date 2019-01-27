/**
 * @license
 * Copyright Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

state_holder = 'queried'
state_list = ['queried','selected','add_new','del','sync']
// [START drive_quickstart]
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
//const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/drive']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), action_redirect);
});

var qString = 'HCC'   // Query variable to be taken from View
var current_search_results = []     // To be consumed by View
var fileId = '1FgiMPgb0ENv8TOYuI3eHqVJLjYK6icG9j2x74xPgFOk'

function action_redirect(auth) {
    switch(state_holder){
        case 'queried':
            listFiles(auth,qString);
            break;
        case 'selected':
            getFileMetadata(auth,fileId);
            break;
        case 'sync':
            driveSync(auth);
            break;
    }
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    //console.log(oAuth2Client.getExpiresInSeconds())
    console.log(oAuth2Client.isTokenExpiring())
    if(oAuth2Client.isTokenExpiring()){
        oAuth2Client.refreshToken()
    }
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    corpora: 'user,allTeamDrives',
    includeTeamDriveItems : true,
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
    q : "name contains 'HCC'",
    supportsTeamDrives : true
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    console.log(res.data)
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
        current_search_results.push(file.id)
      });
      fileId = current_search_results[0]
    } else {
      console.log('No files found.');
    }
  });
}

function driveSync(auth){
    const drive = google.drive({version:'v2',auth});
    var startPage = '';
    drive.changes.getStartPageToken({
        supportsTeamDrives : true,
    }, (err,res) => {
        if(err) return console.log('driveSync:changes.startPageToken returned error : '+err);
        startPage = res.data.startPageToken;
        console.log(startPage);
    });
    drive.changes.list({
        pageToken : startPage,
        restrictToMyDrive : true,
        supportsTeamDrives : true,
        includeRemoved : true
    }, (err,res) => {
        if(err) return console.log('driveSync:changes.list returned error : '+err);
        const current_changes = res.data.changes
        const nextPage = res.data.nextPageToken
        if(changes.length){
            console.log("Changes found in files");
            changes.map((change) => {
                if (change.removed == true){
                    console.log('Removed '+`${change.fileId}, ${change.file.name}`)
                } else {
                    console.log('Modified '+`${change.fileId}, ${change.file.name}`)
                }
            });
        } else {
            console.log('No changes done')
        }
    });
}

function getFileMetadata(auth,fileId) {
    const drive = google.drive({version: 'v2', auth});
    drive.files.get({
        fileId:fileId,
        supportsTeamDrives : true
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      console.log(res.data.alternateLink)
    //  const fileList = res.data
    //   if (files.length) {
    //     console.log('Files:');
    //     files.map((file) => {
    //       console.log(`${file.name} (${file.id})`);
    //     });
    //   } else {
    //     console.log('No files found.');
    //  }
    });
  }
// [END drive_quickstart]
