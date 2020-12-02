objects = globalThis.objects || {};
objects.Screen = (function() {
// if screen element doesn't exist, creates it
// returns object representing it
function Screen(id) {
    let elem = document.getElementById("object-" + id);
    if (elem == null) {
        elem = document.createElement("div");
        elem.classList.add("object");
        elem.classList.add("screen");
        elem.id = "object-" + id;

        let coverElem = document.createElement("div");
        coverElem.classList.add("cover");
        elem.appendChild(coverElem);

        let labelElem = document.createElement("div");
        labelElem.className = "label";
        elem.appendChild(labelElem);

        mapElem.appendChild(elem);
    }

    this.elem = elem;
    this.id = id;
}

Screen.prototype.update = function(data) {
    if (data.owner == me.id && this.elem.querySelector("button") == null) {
        let screenId = this.id;

        let closeElem = document.createElement("button");
        closeElem.classList.add("button");
        closeElem.classList.add("button-close");
        closeElem.onclick = function() {
            API.screen_close(me.key, screenId);    
        }
        
        let deleteElem = document.createElement("button");
        deleteElem.classList.add("button");
        deleteElem.classList.add("button-delete");
        deleteElem.onclick = function() {
            API.screen_delete(me.key, screenId);    
        }

        let youtubeElem = document.createElement("button");
        youtubeElem.classList.add("button");
        youtubeElem.classList.add("button-youtube");
        youtubeElem.onclick = function() {
            let videoUrl = window.prompt("Video URL");
            let videoId = youtubeURLtoID(videoUrl);
            if (videoId) {
                API.screen_youtube(me.key, screenId, videoId);
            }
        };

        this.elem.appendChild(youtubeElem);
        this.elem.appendChild(deleteElem);
        this.elem.appendChild(closeElem);
    }

    if (me.position) {
        this.elem.style.marginTop = (data.position[1] - me.position[1]) * 24 + "px";
        this.elem.style.marginLeft = (data.position[0] - me.position[0]) * 24 + "px";
    }

    const labelElem = this.elem.getElementsByClassName("label")[0];
    let ytElem = this.elem.getElementsByClassName("youtube")[0];
    if (data.content && data.content.youtube) {
        labelElem.innerHTML = "YouTube";
        this.elem.style.background = labelElem.style.background = "hsl(0, 60%, 40%)";

        if (!ytElem) {
            ytElem = document.createElement("iframe");
            ytElem.classList.add("youtube");
            ytElem.style.display = "block";
            this.elem.appendChild(ytElem);
        }

        let secondsPassed = (Date.now() - new Date(data.content.time_start).getTime()) / 1000;
        ytElem.style.display = "block";
        if (ytElem.src.indexOf(data.content.video) == -1) {
            ytElem.src = "https://www.youtube.com/embed/" + data.content.video + "?rel=0&autoplay=1&disablekb=1&controls=0&start=" + Math.round(secondsPassed);
        }
    } else {
        this.elem.style.background = labelElem.style.background = "hsl(25, 30%, 20%)";
        labelElem.innerHTML = "Screen";
        if (ytElem) {
            ytElem.style.display = "none";
            ytElem.src = "about:blank";
        }
    }
}

return Screen;
})();