let addButton = document.getElementById("sh-add-btn");
let playButton = document.getElementById("sh-play-btn");
let showButton = document.getElementById("sh-show-btn");


let pointsTable = document.getElementById("sh-table");

let points = [];

addButton.onclick = () => 
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: "getPoint" }, function(response) {          
            let point = {
                id: points.length,
                name: 'Point',
                scroll: response.scrollY,
                time: 1500,
                speed: '1000'
            };

            points.push(point);
            sh__updateTable();
            /*chrome.storage.sync.set({key: value}, function() {
                console.log('Value is set to ' + value);
            });*/
        });
    });
};

function sh__updateTable() {
    let html = '';

    for (let point of points) {
        html += 
            '<div class="sh-table__row">' +
                '<div class="sh-table__no">' + point.id + '</div>' +
                '<div class="sh-table__name">' + point.name  +'</div>' +
                '<div class="sh-table__scroll">' + point.scroll + '</div>' +
                '<div class="sh-table__time">' + point.time + '</div>' +
                '<div class="sh-table__speed">' + point.speed + '</div>' +
            '</div>';
    }

    pointsTable.innerHTML = html;

    sh__updatePoints();
}

function sh__updatePoints() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: "showPoints", points });
    });
}

/*
function sh__getPoints(url) {
    chrome.storage.sync.get('sh-' + url, function(result) {
        return result;
      });
}
*/

playButton.onclick = () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log(points);
        chrome.tabs.sendMessage(tabs[0].id, { command: "playAnimation", points });
    });
};

showButton.onclick = () => {
    sh__updatePoints();
};

