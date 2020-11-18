let addButton = document.getElementById("sh-add-btn");
let playButton = document.getElementById("sh-play-btn");
let clearButton = document.getElementById("sh-clear-btn");

let pointsTable = document.getElementById("sh-table");

window.onload = function() {
    sh__updateTable();
}

function sh__addPoint(point, cb) {
    chrome.runtime.sendMessage({command: "addPoint", point}, function(response) {
        cb(response);
    });
}

function sh__getPoints(cb) {
    chrome.runtime.sendMessage({command: "getData"}, function(response) {
        cb(response);
    })
}

function sh__updateData(points, cb) {
    chrome.runtime.sendMessage({command: "updateData", points}, function(response) {
        cb(response);
    })
}


function sh__updateTable() {
    let html = '';

    sh__getPoints((response) => {
        let points = response.data;

        /*html += 
            '<tr>' +
                '<th></th>' +
                '<th>Time (ms)</th>' +
                '<th>Speed (ms)</th>' +
            '</tr>';*/

        for (let point of points) {
            /*html += 
                '<tr class="sh-table__row">' +
                    //'<td class="sh-table__no">' + point.id + '</td>' +
                    '<td></td>' +
                    '<td><div style="background: hsl(' + point.hue + ',100%,70%); color:#fff;width:22px;height: 22px;border-radius: 100px;text-align: center;font-size: 14px;font-family: \'Montserrat\', sans-serif;line-height: 22px;font-weight: 600;">' + point.id + '</div></td>' + 
                    '<td class="sh-table__time">' + 
                        '<input class="sh-input" data-key="time" data-id="' + point.id + '" style="width:50px" type="text" value="' + point.time + '">' +
                    '</td>' +
                '</tr>' +
                '<tr class="sh-table__row">' +
                    '<td class="sh-table__speed">' + 
                            '<input class="sh-input" data-key="speed" data-id="' + point.id + '" style="width:50px" type="text" value="' + point.speed + '">' +
                    '</td>' +
                    '<td></td>' +
                    '<td></td>' +
                '</tr>';*/
            
            html += 
                '<div class="sh-point" style="display:flex; align-items:center" data-hue="' + point.hue + '" data-id="' + point.id + '">' + 
                    '<div style="background: hsl(' + point.hue + ',100%,50%); color:#fff;width:22px;height: 22px;border-radius: 100px;border: 3px solid white; text-align: center;font-size: 14px;font-family: \'Montserrat\', sans-serif;line-height: 22px;font-weight: 600;">' + point.id + '</div>' +
                    (point.id === points.length - 1 
                        ? ''
                        : '<input class="sh-input" data-key="time" data-id="' + point.id + '" style="height:20px;width:50px;margin-left:30px" type="text" value="' + point.time + '">') +
                '</div>' +
                '<div style="display:flex;' + (point.id === points.length - 1 ? '' : 'height:40px;') + 'align-items:center" data-id="' + point.id + '">' + 
                    (point.id === points.length - 1 
                        ? ''
                        : '<input class="sh-input" data-key="speed" data-id="' + point.id + '" style="height:20px;width:50px;margin-left:58px" type="text" value="' + point.speed + '">') +
                '</div>';
                
        }

        pointsTable.innerHTML = html;

        sh__linkPoints();

        sh__updatePoints();
    });
}

function sh__linkPoints() {
    let points = [...document.querySelectorAll('.sh-point')];

    if (points.length <= 1) {
        return;
    }

    for (let i = 0; i < points.length - 1; i++) {
        let top = points[i].offsetTop + 85;
        let height = points[i+1].offsetTop - points[i].offsetTop;
        let hue_1 = points[i].dataset.hue;
        let hue_2 = points[i+1].dataset.hue;

        points[i].innerHTML += '<div style="z-index:-1;background:linear-gradient(180deg, hsl(' + hue_1 + ',100%,50%) 0%, hsl(' + hue_2 + ',100%,50%) 100%);width:6px;position:absolute;top:' + top + ';height:' + height + ';left:41px;"></div>';
    }
}

function sh__updatePoints() {
    sh__getPoints((response) => {
        let points = response.data;

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { command: "showPoints", points });
        });
    })
}

function sh__tableToObject() {
    let inputs = [...document.querySelectorAll('.sh-input')];   // spread-оператор позволяет сделать массив из Array-like объекта

    let res = inputs.reduce((acc, cur) => {
        let i = parseInt(cur.dataset.id, 10);
        if (typeof acc[i] === 'undefined') {
            acc[i] = {}; 
        }
        acc[i][cur.dataset.key] = cur.value;
        return acc;
    }, []);

    return res;
}

function sh__getNewHue(data) {
    if (data.length === 0) {
        return Math.floor(Math.random() * 360);
    }
    return (data[data.length - 1].hue + 30) % 360;
}

function sh__initPoint(scroll) {
    sh__getPoints((response) => {
        let point = {
            name: 'Point',
            scroll: scroll,
            time: 2000,
            speed: 1000,
            hue: sh__getNewHue(response.data)
        };

        sh__addPoint(point, sh__updateTable);
    });
}

addButton.onclick = () => 
{   
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { command: "getPoint" }, function(response) {
            sh__initPoint(response.scrollY);
        });
    });
};

playButton.onclick = () => {
    const points = sh__tableToObject();

    sh__updateData(points, () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { command: "playAnimation" });
        });
    })
};

clearButton.onclick = () => {
    chrome.runtime.sendMessage({command: "clearData"});
    sh__updateTable();
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.command === 'closePopup') {
            window.close();
        }
    }
)

/**
 * Temporary workaround for secondary monitors on MacOS where redraws don't happen
 * @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
 */
chrome.runtime.getPlatformInfo(function(info) {
  if (info.os === 'mac') {
    const fontFaceSheet = new CSSStyleSheet()
    fontFaceSheet.insertRule(`
      @keyframes redraw {
        0% {
          opacity: 1;
        }
        100% {
          opacity: .99;
        }
      }
    `)
    fontFaceSheet.insertRule(`
      html {
        animation: redraw 1s linear infinite;
      }
    `)
    document.adoptedStyleSheets = [
      ...document.adoptedStyleSheets,
      fontFaceSheet,
    ]
  }
})