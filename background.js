/*chrome.runtime.onMessage.addListener(
    (message, callback) => {
      if (message == 'addPoint') {
        chrome.tabs.executeScript({
            file: 'contentScript.js'
        });
      }
});*/

/*
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
    }
});*/

let data = [];

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.command) {
    case "getData":
      sendResponse({ data });
      break;
    case "addPoint":
      // Назначение ID
      let point = request.point;
      point.id = data.length;

      data.push(request.point);
      sendResponse({ data });
      break;
    case "clearData":
      data = [];
      break;

    case "updateData":
      data.forEach((item, i) => {
        if (typeof request.points[i].time !== 'undefined') {
          item.time = request.points[i].time;
        }

        if (typeof request.points[i].speed !== 'undefined') {
          item.speed = request.points[i].speed;
        }
      })
    break;
    }
  });

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    data = [];
});