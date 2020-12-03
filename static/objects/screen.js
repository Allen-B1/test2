objects = globalThis.objects || {};
objects.Screen = (function() {
    function youtubeURLtoID(url) {
        try {
            url = new URL(url);
            if (url.host == "youtu.be"){ 
                return url.pathname.slice(1);
            } else if (url.host == "youtube.com" || url.host == "www.youtube.com") {
                return url.searchParams.get("v");
            }
            return null;
        } catch(err) {
            return null;
        }
    }

    // [channel, video]
    function twichURLtoID(url) {
        try {
            url = new URL(url);
            if ((url.host == "twitch.tv" || url.host == "www.twitch.tv") && url.pathname.length > 1) {
                if (url.pathname.startsWith("/videos")) {
                    return ["", url.pathname.slice("/videos/".length)];
                }
                return [url.pathname.slice(1), ""];
            }
            return null;
        } catch(err) {
            return null;
        }
    }

    function getYouTubeTitle(vidId) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                let json = JSON.parse(xhr.responseText);
                resolve(json.title);
            };
            xhr.open("GET", location.protocol + "//noembed.com/embed?url=" + encodeURIComponent("https://youtube.com/watch?v=" + vidId));
            xhr.send();
        });
    }

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

            let fullscreenElem = document.createElement("button");
            fullscreenElem.className = "button button-fullscreen";
            fullscreenElem.onclick = () => {
                this.fullscreen();
            }
            elem.appendChild(fullscreenElem);

            mapElem.appendChild(elem);
        }

        this.elem = elem;
        this.id = id;
    }

    Screen.prototype.fullscreen = function(full) {
        if (full === null || full === undefined) {
            this.elem.classList.toggle("fullscreen");
        } else if (full) {
            this.elem.classList.add("fullscreen");
        } else {
            this.elem.classList.remove("fullscreen");
        }
    }

    Screen.prototype.update = function(data) {
        if (data.owner == me.id && this.elem.querySelector(".button-delete") == null) {
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
            youtubeElem.classList.add("button-video");
            youtubeElem.onmouseup = function() {
                let videoUrl = window.prompt("Video URL");
                let videoId = youtubeURLtoID(videoUrl);
                if (videoId) {
                    API.screen_youtube(me.key, screenId, videoId);
                } else if (videoId = twichURLtoID(videoUrl)) {
                    API.screen_twitch(me.key, screenId, videoId[0], videoId[1]);
                }
            };

            this.elem.appendChild(youtubeElem);
            this.elem.appendChild(deleteElem);
            this.elem.appendChild(closeElem);
        }

        position = me.position || [0, 0];
        this.elem.style.marginTop = (data.position[1] - position[1]) * 24 + "px";
        this.elem.style.marginLeft = (data.position[0] - position[0]) * 24 + "px";

        const labelElem = this.elem.getElementsByClassName("label")[0];
        let iframeElem = this.elem.getElementsByTagName("iframe")[0];
        if (data.content && data.content.youtube) {
            this.elem.classList.remove("twitch");
            this.elem.classList.add("youtube");

            if (!iframeElem) {
                iframeElem = document.createElement("iframe");
                iframeElem.style.display = "block";
                this.elem.appendChild(iframeElem);
            }

            let secondsPassed = (Date.now() - new Date(data.content.time_start).getTime()) / 1000;
            iframeElem.style.display = "block";
            if (iframeElem.src.indexOf(data.content.video) == -1) {
                iframeElem.src = "https://www.youtube.com/embed/" + data.content.video + "?rel=0&autoplay=1&disablekb=1&controls=0&start=" + Math.round(secondsPassed);
                labelElem.innerHTML = "YouTube";
                getYouTubeTitle(data.content.video).then(function(title) {
                    labelElem.innerText = title;
                });
            }
        } else if (data.content && data.content.twitch) {
            this.elem.classList.remove("youtube");
            this.elem.classList.add("twitch");

            if (!iframeElem) {
                iframeElem = document.createElement("iframe");
                iframeElem.style.display = "block";
                this.elem.appendChild(iframeElem);
            }
            iframeElem.style.display = "block";
            if ((!data.content.channel || iframeElem.src.indexOf(data.content.channel) === -1) &&  (!data.content.video || iframeElem.src.indexOf(data.content.video) === -1)) {
                if (data.content.channel) {
                    iframeElem.src = "https://player.twitch.tv/?autoplay=true&parent=" + location.host + "&channel=" + data.content.channel;
                    labelElem.innerText = data.content.channel;
                } else {
                    let secondsPassed = Math.round((Date.now() - new Date(data.content.time_start).getTime()) / 1000);
                    labelElem.innerText = "Twitch";
                    iframeElem.src = "https://player.twitch.tv/?autoplay=true&parent=" + location.host + "&video=v" + data.content.video + "&time=" + secondsPassed + "s";
                }
            }
        } else {
            this.elem.classList.remove("youtube", "twitch");
            labelElem.innerHTML = "Screen";
            if (iframeElem && iframeElem.src !== "about:blank") {
                iframeElem.style.display = "none";
                iframeElem.src = "about:blank";
            }
        }
    }

    return Screen;
})();