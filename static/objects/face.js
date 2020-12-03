let objects = globalThis.objects || {};
objects.Face = (function() {
    function Face(id) {
        let elem = document.getElementById("object-" + id);
        if (elem == null) {
            elem = document.createElement("div");
            elem.classList.add("face");
            elem.classList.add("object");
            if (id == me.id) {
                elem.classList.add("me");
            }
            elem.id = "object-" + id;

            let smile = document.createElement("div");
            smile.classList.add("smile");
            elem.appendChild(smile);

            mapElem.appendChild(elem);
        }
        this.elem = elem;
        this.id = id;
    }

    Face.prototype.update = function(data) {
        if (me.id == this.id) {
            this.elem.style.marginTop = 0;
            this.elem.style.marginLeft = 0;
        } else {
            position = me.position || [0, 0];
            this.elem.style.marginTop = (data.position[1] - position[1]) * 24 + "px";
            this.elem.style.marginLeft = (data.position[0] - position[0]) * 24 + "px";
        }
        this.elem.setAttribute("data-color", data.color);
    }

    return Face;
})();