const message = document.querySelector(".message");
const output = document.querySelector(".que");
const nx = document.querySelector(".next");
const game = {};
const signIn = document.querySelector("#signin-button");
const youtubeLink = document.querySelector("#link");
const saveBtn = document.querySelector("#saveBtn");

// signIn.setAttribute("disabled", "true");

// nx.addEventListener("click", createQuestion);
// const url =
//   "https://script.google.com/macros/s/AKfycbyaXSH1Dsrd_JVNfSPWblP0vcwjcPCE3Y5Mgq9zbGUUVkW5_6Af/exec";
let spreadsheetId;
let newTitle = "playlist title";
let videosArray = [["Title", "Channel", "Video URL", "Publish Date"]];
$(document).ready(function () {
  // let playlistId = "";

  function getPlaylistId() {
    let playlistId = link.value.match(new RegExp("list=" + "(.*)" + "&"))[1];
    options.playlistId = playlistId;
    secondOptions.id = playlistId;
    console.log(playlistId);
  }

  const key = "AIzaSyATGOnTIpuyJWRkePUQvRaRXx4DaMhvDN8";
  // const playlistId = "PL5INMYqpdJzmVE08RJkjjg-AiJe4UYjyT";
  // const playlistId = "PL5INMYqpdJzmVE08RJkjjg-AiJe4UYjyT";
  const URL = "https://www.googleapis.com/youtube/v3/playlistItems";
  let options = {
    part: "snippet",
    key: key,
    maxResults: 50,
  };
  let secondOptions = {
    part: "snippet",
    key: key,
  };
  function getPlaylistTitle() {
    const URL = "https://www.googleapis.com/youtube/v3/playlists";
    $.getJSON(URL, secondOptions, function (params) {
      console.log(params.items[0].snippet.title);
      newTitle = params.items[0].snippet.title;
    });
  }

  let totalVidsExtracted = 0;
  let videoCount = 0;
  function loadVideos(URL, options) {
    $.getJSON(URL, options, function (params) {
      if (totalVidsExtracted === params.pageInfo.totalResults) {
        console.log("end");
        return;
      }
      // if (params.nextPageToken) options.pageToken = params.nextPageToken;
      options.pageToken = params.nextPageToken;

      for (const video of params.items) {
        videoCount++;
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const publishDate = video.snippet.publishedAt;
        const description = video.snippet.description;
        const videoId = video.snippet.resourceId.videoId;
        const videoURL = `https://www.youtube.com/watch?v=${videoId}`;

        videosArray.push([title, channel, videoURL, publishDate]);
      }
      console.log(params.items);

      totalVidsExtracted += options.maxResults;
    });
  }

  // getting the total elements in playlist
  let totalVids;
  function getTotalVideos(URL, options) {
    $.getJSON(URL, options, function (params) {
      totalVids = params.pageInfo.totalResults;
    });
  }
  function showLoading() {
    const newDiv = document.createElement("div");
    const newContent = document.createTextNode("loading...");
    newDiv.setAttribute("id", "loading");
    newDiv.appendChild(newContent);
    // const currentDiv = document.getElementById("div1");
    // document.body.insertBefore(newDiv, currentDiv);
    document.body.appendChild(newDiv);
  }
  async function start() {
    showLoading();
    getPlaylistId();
    await sleep(500);
    getPlaylistTitle();
    await sleep(500);
    getTotalVideos(URL, options);
    await sleep(500);
    while (totalVids > totalVidsExtracted) {
      loadVideos(URL, options);
      await sleep(500);
    }
    console.log("ready");

    signIn.removeAttribute("disabled");
    document.querySelector("#loading").innerHTML = `<p>Ready</p>`;
  }
  saveBtn.addEventListener("click", start);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});

// store the data extracted to a google sheets

// create spreadsheet

function makeApiCall() {
  gapi.client.sheets.spreadsheets
    .create({
      properties: {
        title: newTitle,
      },
    })
    .then((response) => {
      console.log(response.result);
      console.log(response.result.spreadsheetId);
      spreadsheetId = response.result.spreadsheetId;
      console.log(response.result.spreadsheetUrl);
      makeSecondApiCall();
    });
}

function makeSecondApiCall() {
  var params = {
    // The ID of the spreadsheet to update.
    // spreadsheetId: "1ApgoKM_dzEaEHIpUNSWwss8VpdGz6-1-is0TSDP2Jgs", // TODO: Update placeholder value.
    spreadsheetId: spreadsheetId, // TODO: Update placeholder value.

    // The A1 notation of the values to update.
    range: "Sheet1", // TODO: Update placeholder value.

    // How the input data should be interpreted.
    valueInputOption: "RAW", // TODO: Update placeholder value.
  };

  var valueRangeBody = {
    range: "Sheet1",
    majorDimension: "ROWS",
    values: videosArray,
  };

  var request = gapi.client.sheets.spreadsheets.values.update(
    params,
    valueRangeBody
  );
  request.then(
    function (response) {
      // TODO: Change code below to process the `response` object:
      console.log(response.result);
      console.log("saved");
    },
    function (reason) {
      console.error("error: " + reason.result.error.message);
    }
  );
}

function initClient() {
  var API_KEY = "AIzaSyDdv5jsplYX7HY3E35Ke1SozlJ-31p3SPM"; // TODO: Update placeholder with desired API key.

  var CLIENT_ID =
    "246903241309-cf4jvkekfj302tcg2ktrufa5r43821i4.apps.googleusercontent.com"; // TODO: Update placeholder with desired client ID.

  var SCOPE = "https://www.googleapis.com/auth/spreadsheets";

  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPE,
      discoveryDocs: [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
      ],
    })
    .then(function () {
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
      updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function updateSignInStatus(isSignedIn) {
  if (isSignedIn) {
    makeApiCall();
  }
}

function handleSignInClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}
// async function save() {
//   makeApiCall();
//   await sleep(2000);
//   // makeSecondApiCall();
//   await sleep(2000);
//   console.log("saved");
// }

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
