// Client ID and API key from the Developer Console
var CLIENT_ID = '1096035042818-a33ldrol57b1fsfeq3bfbsqgqcsk2j0o.apps.googleusercontent.com';
var API_KEY = 'AIzaSyA7UoF0ySu5wypvPP7qAn9AYelL0FXPgIw';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function (error) {
        console.error(error)
        // appendPre(JSON.stringify(error, null, 2));
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        getCalendarList()
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}


function createEvent(event) {
    return new Promise( resolve => {
        var request = gapi.client.calendar.events.insert({
            'calendarId': calendarId,
            'resource': event
        });
    
        request.execute(function (event) {
            resolve(event);
        });    
    })
}

function getCalendarList(){
    let request = gapi.client.calendar.calendarList.list()
    request.execute(({ items }) => {
        items.forEach( ({ summary, id, accessRole }) => {
            if(accessRole == 'reader') return
            let option = document.createElement('option')
            option.value = id
            option.append(summary)
            calendarInput.append(option)
        })
    })
}