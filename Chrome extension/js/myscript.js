/*
 * Subtitles For Youtube
 *
 * Created by Yash Agarwal
 * Copyright (c) 2014 Yash Agarwal. All rights reserved.
 *
 */

var subBubblesVideo;
  /* Store display status for subs */
var areSubtitlesShowing = true;
/* Store sub delay in seconds. could be negative or positive */
var subtitlesSync = 0.0;
/* Timer for display sub-info span */
var subInfoDisplayTimer;
/* Font size of subtitles in px */
var subtitlesSize = "20";
/* Help message for subtitles */
var shortcutsMessage =  "Subtitles Shortcuts\\n\\n" +
                        "V : Show/Hide \\n" +
                        "G : -50ms delay \\n" +
                        "H : +50ms delay \\n" +
                        "Q : decrease font size \\n" +
                        "W : increase font size";

var autoLoad = false;
var subLanguage = "";
var tag = "";
var originalTag = "";
var originalUrl = "";

function fadeOutSubtitlesInfo() {
  if (subInfoDisplayTimer) {
    clearTimeout(subInfoDisplayTimer);
  }
  /* set a new subInfoDisplayTimer
   * wait for 1 second of no subInfoDisplayTimer
   * events before firing our changes */
  subInfoDisplayTimer = setTimeout(function() {
    $("#sub-info").fadeOut(3000);
  }, 1000);
}

/* Takes input as the url of the subtitle file and
 * loads subtitle on youtube video
 * add second argument to decide if it's from local file */
function loadSubtitles(subtitlesURL, isLocalFile, encoding) {
  /* Hide any previously uploaded subtitles */
  $('.subtitles').css("display", "block");

  /* Initialize new bubbles instance */
  if (!subBubblesVideo) {
    subBubblesVideo = new Bubbles.video('sub-video');
    registerKeyboardListeners();
  }

  /* language does not matter, set url correctly */
  var data = {
    "English": {
      language: "English",
      file: subtitlesURL,
      encoding: encoding,
      isLocalFile: isLocalFile
    }
  };

  subBubblesVideo.subtitles(false, data);

  $('#sub-info').css("opacity", 1);
  $("#sub-message").html("Subtitle upload completed. Enjoy!!! :)");
  $("#sub-message").fadeOut(3000);
  setTimeout(function() {
    $("#sub-message").html("Drag and drop SRT or Zipped srt file here to " +
      "add different subtitles to video or <a onclick=\"alert('" + shortcutsMessage + "')\">View Shortcuts</a>");
    $("#sub-message").fadeIn(3000);

    /* This is required because on adding subtitles some thing happens and
     * video is shifted 14-15px below */
    $('video').css("top","0px");
  }, 3000);
}

function registerKeyboardListeners() {
  window.addEventListener('keydown', function(e) {
    if (e.keyCode == 'v'.charCodeAt() || e.keyCode == 'V'.charCodeAt()) {
      if (areSubtitlesShowing) {
        console.log("Switching off subtitles");
        subBubblesVideo.subsShow(false);
        areSubtitlesShowing = false;
        $("#sub-info").html("Subtitles disabled").fadeIn();
        fadeOutSubtitlesInfo();
      } else {
        subBubblesVideo.subsShow(true);
        areSubtitlesShowing = true;
        console.log("Switching on subtitles");
        $("#sub-info").html("Subtitles enabled").fadeIn();
        fadeOutSubtitlesInfo();
      }
    }
    if (e.keyCode == 'g'.charCodeAt() || e.keyCode == 'G'.charCodeAt()) {
      subtitlesSync -= 0.050; //precede by 50ms
      subBubblesVideo.subsSync(subtitlesSync);
      console.log("Delaying subs by -0.050ms");
      $("#sub-info").html("Subtitle delay: " + Math.round(subtitlesSync * 1000) + "ms").fadeIn();
      fadeOutSubtitlesInfo();
    }
    if (e.keyCode == 'h'.charCodeAt() || e.keyCode == 'H'.charCodeAt()) {
      subtitlesSync += 0.050; //delay by 50ms
      subBubblesVideo.subsSync(subtitlesSync);
      console.log("Delaying subs by +0.050ms");
      $("#sub-info").html("Subtitle delay: " + Math.round(subtitlesSync * 1000) + "ms").fadeIn();
      fadeOutSubtitlesInfo();
    }
    if (e.keyCode == 'q'.charCodeAt() || e.keyCode == 'Q'.charCodeAt()) {
      subtitlesSize -= 1;
      if (subtitlesSize < 0) {
        subtitlesSize = 0;
      }
      if (subtitlesSize > 40) {
        subtitlesSize = 40;
      }
      $(".subtitles").css("font-size", subtitlesSize + "px");
      storeFontSizeInLocalStorage(subtitlesSize);
      $("#sub-info").html("Sub size: " + subtitlesSize).fadeIn();
      fadeOutSubtitlesInfo();
    }
    if (e.keyCode == 'w'.charCodeAt() || e.keyCode == 'W'.charCodeAt()) {
      subtitlesSize += 1;
      if (subtitlesSize < 0) {
        subtitlesSize = 0;
      }
      if (subtitlesSize > 40) {
        subtitlesSize = 40;
      }
      $(".subtitles").css("font-size", subtitlesSize+"px");
      storeFontSizeInLocalStorage(subtitlesSize);
      $("#sub-info").html("Sub size: " + subtitlesSize).fadeIn();
      fadeOutSubtitlesInfo();
    }
  }, false);
}

/* Function used to initliaze extension */
function initExtension() {

  /*sub-message is used to show status about upload status of subtitle file
  It appears just below the youtube video */
  // $("#watch7-content").prepend("<div id='subitle-container-first' class='yt-card yt-card-has-padding'><span id='sub-message'></span><a id='sub-open-search-btn'> or Search Subtitles</a></div>");

  if ($("video").length === 0) {
    console.log("Flash video found. Return");
    $("#sub-message").html("This youtube video runs on Adobe Flash." + "Adding subtitles is not supported for it yet.");
    $("#sub-message").fadeOut(3000);
    $("#sub-open-search-btn").css("display", "none");
  } else {
    /* sub-info is used to display information about subs
     * like sync delay or enabled/disabled status.
     * It appears inside youtube video just above the controls toolbar */
    // $("#sub-message").html("Drag and drop SRT or Zipped srt file here to add subtitles to video");
    $("#srt-upload-name").html("Click or drag & drop subtitle file here");
    $('video').attr('id', 'sub-video');
    // $("#sub-video").after("<span id='sub-info'></span>");
    // $('#subitle-container-first').after('<input id="fileupload" type="file" name="uploadFile" style="display:none"/>');
    // $('#fileupload').after("<div id='sub-open-subtitles' style='display:none' class='yt-card yt-card-has-padding'><div>");

    $('#watch-action-panels').after("<div id='new-subtitles-con' style='display:none; position: relative;' class='watch-action-panels yt-uix-button-panel hid yt-card yt-card-has-padding'><div>");
    $('.yt-uix-button.action-panel-trigger-share').after('<button id="subtitle-button" class="yt-uix-button yt-uix-button-size-default yt-uix-button-opacity yt-uix-button-has-icon action-panel-trigger-subtitle" type="button" onclick=";return false;" data-button-toggle="true"><span style="margin-right:9px;"><img src="'+ chrome.extension.getURL("images/subtitles_icon.svg")+'" width="18px"></span><span class="yt-uix-button-content">Subtitles</span></button>')

    $("#new-subtitles-con").load(chrome.extension.getURL("subtitles-tab.html"), function() {
      registerEvents();

      var initTagAndUrl = function() {
        setInterval(function() {
          var newTag = $('.ytp-title-link.yt-uix-sessionlink').text().trim().split('.').join(' ');
          var newUrl = $('.ytp-title-link.yt-uix-sessionlink').attr("href");
          if (newTag && newUrl) {
            if (newUrl != originalUrl) {
              console.log("Playing a new video with url: " + newUrl + " and tag: " + newTag);
              originalTag = newTag;
              originalUrl = newUrl;
              tag = newTag;
              if (autoLoad) {
                $("#subtitle-button").click();
              }
            }
          }
        }, 1000);
      };

      initDataFromLocalStorage(function() {
        initTagAndUrl();
      });
    });

  }
}

initExtension();

function storeAutoLoadFlag(autoLoad) {
  chrome.storage.local.set({
      "autoLoad": autoLoad
  }, function() {
    console.log("Stored autoLoad: " + autoLoad + " in chrome storage");
  });
}

function storeFontSizeInLocalStorage(fontSize) {
  chrome.storage.local.set({
      "subfontsize": fontSize
  }, function() {
    console.log("Stored font size: " + fontSize + " in chrome storage");
  });
}

function initDataFromLocalStorage(callback) {
  chrome.storage.local.get(null, function(result) {
    console.log("Found font size in local storage:" + result["subfontsize"]);
    console.log("Found autoLoad in local storage:" + result["autoLoad"]);
    console.log("Found language id in local storage:" + result["sublanguageid"]);
    if (result["subfontsize"]) {
      subtitlesSize = result["subfontsize"];
      $(".subtitles").css("font-size", subtitlesSize + "px");
    }
    if (result["autoLoad"] !== null && result["autoLoad"] !== undefined) {
      autoLoad = result["autoLoad"];
      $("#subtitles-auto-load").prop('checked', autoLoad);
    } else {
      autoLoad = false;
    }
    if (result["sublanguageid"]) {
      subLanguage = result["sublanguageid"];
      $("#sub-language").val(subLanguage);
    }
    callback();
  });
}