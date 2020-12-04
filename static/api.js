var API = {
    create: function(key) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.open("POST", "/create?key=" + key);
            xhr.send();
        });
    },
    move: function(key, x, y) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.open("POST", "/move?key=" + key + "&x=" + x + "&y=" + y);
            xhr.send();
        });
    },
    objects: function(key) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.open("GET", "/objects?key=" + key);
            xhr.send();
        });
    },
    screen_create: function(key) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.open("POST", "/screen/create?key=" + key);
            xhr.send();
        });
    },
    screen_close: function(key, screen) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.open("POST", "/screen/close?key=" + key + "&screen=" + screen);
            xhr.send();
        });
    },
    screen_delete: function(key, screen) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.open("POST", "/screen/delete?key=" + key + "&screen=" + screen);
            xhr.send();
        });
    },
    screen_video: function(key, screen, type, contentID, timeOffset) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.open("POST", "/screen/video?key=" + key + "&screen=" + screen + "&type=" + type + "&content_id=" + contentID + "&time_offset=" + timeOffset);
            xhr.send();
        });
    },
    face_rename: function(key, name) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.open("POST", "/face/rename?key=" + key + "&name=" + name);
            xhr.send();
        });
    },
    face_kill: function(key) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.open("POST", "/face/kill?key=" + key);
            xhr.send();
        });
    }

};