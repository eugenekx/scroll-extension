chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.command) {
            case 'getPoint':
                sendResponse({ scrollY: window.scrollY });
                break;
            case 'playAnimation':
                sh__playAnimation(request.points);
                break;
            case 'showPoints':
                sh__showPoints(request.points);
                break;
        }    
});

function sh__showPoints(points) {
    let overlays = document.querySelectorAll('.sh-overlay');
    overlays.forEach(el => el.remove());

    for (point of points) {
        let div = document.createElement("div");

        div.setAttribute("class", "sh-overlay");

        div.style.width = "100vw";
        div.style.height = "100vh";
        div.style.display = "fixed";
        div.style.borderTop = "5px solid #0064bd";
        div.style.position = "absolute";
        div.style.zIndex = 9999;
        div.style.top = point.scroll + 'px';

        div.innerHTML = 
            '<div style="background:#0064bd;color:#fff;padding-bottom:5px;padding-left:10px;width:150px">' + point.id + ' ' + point.name + '</div>';

        document.body.appendChild(div);
    }
}

function sh__playAnimation(points) {
    let time = 0;

    window.scrollTo({ top: points[0].scroll, behavior: 'instant' });

    for (let i = 1; i < points.length; i++) {
        time += points[i-1].time;
        //setTimeout(() => { window.scrollTo({ top: points[i].scroll, behavior: 'smooth' }); console.log(points[i].scroll) }, time);
        setTimeout(() => { zenscroll.toY(points[i].scroll, points[i].speed) }, time);
    }
}