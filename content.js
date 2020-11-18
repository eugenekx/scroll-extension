chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.command) {
            case 'getPoint':
                sendResponse({ scrollY: window.scrollY });
                break;
            case 'playAnimation':
                sh__playAnimation();
                break;
            case 'showPoints':
                console.log(request.points);
                sh__showPoints(request.points);
                break;
        }    
});

function sh__showPoints(points) {
    sh__erasePoints();

    for (point of points) {
        let div = document.createElement("div");

        div.setAttribute("class", "sh-overlay");

        div.style.width = "100vw";
        div.style.height = "100vh";
        div.style.display = "fixed";
        div.style.borderTop = "3px solid hsl(" + point.hue + ",100%,50%)";
        div.style.borderBottom = "3px solid hsl(" + point.hue + ",100%,50%)";
        div.style.position = "absolute";
        div.style.zIndex = 999999;
        div.style.pointerEvents = "none";
        //div.style.boxShadow = "0px 20px 20px 20px rgba(255, 0, 0, 0.15)";
        div.style.top = point.scroll + 'px';
        div.style.boxShadow = "0px 0px 20px 20px rgba(0,0,0,0.1)";

        div.innerHTML = 
            '<div style="background: hsl(' + point.hue + ',100%,50%); color:#fff;width:24px;height: 24px;border-radius: 100px;position: relative;top: -12px;left: 30px;text-align: center;font-size: 14px;font-family: \'Montserrat\', sans-serif;line-height: 24px;font-weight: 600;">' + point.id + '</div>';

        document.body.appendChild(div);
    }
}

function sh__playAnimation() {
    let time = 0;

    sh__getPoints((response) => {
        let data = response.data;

        sh__closePopup();
        sh__erasePoints();

        window.scrollTo({ top: data[0].scroll, behavior: 'instant' });
        time += parseInt(data[0].time, 10);

        let st = Date.now();
        console.log("start " + time);
        setTimeout(() => { 
            console.log(Date.now() - st);
            console.log(data[1].scroll);
            zenscroll.toY(parseInt(data[1].scroll, 10), parseInt(data[0].speed, 10)) 
        }, time);

        for (let i = 1; i < data.length - 1; i++) {
            time += parseInt(data[i-1].speed, 10);
            time += parseInt(data[i].time, 10);
            console.log("start " + time);
            
            setTimeout(() => { 
                console.log(Date.now() - st);
                console.log(data[i].scroll);
                zenscroll.toY(parseInt(data[i+1].scroll, 10), parseInt(data[i-1].speed, 10)) 
            }, time);
        }
    })

    
}

function sh__closePopup() {
    chrome.runtime.sendMessage({command: "closePopup"});
}

function sh__erasePoints() {
    let overlays = document.querySelectorAll('.sh-overlay');
    overlays.forEach(el => el.remove());
}

function sh__getPoints(cb) {
    chrome.runtime.sendMessage({command: "getData"}, function(response) {
        cb(response);
    })
}