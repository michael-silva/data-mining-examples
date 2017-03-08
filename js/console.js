var console = {
	_elem: null,
	_lazy: [],
	_append: function(text) {
		var child = document.createElement("div");
		child.classList.add("console-item");
		child.appendChild(document.createTextNode(text));
		this._elem.appendChild(child);
	},
	_log: function(pre, arguments) {
		var self = this;
			for(var key in arguments) {
				if(Array.isArray(arguments[key])) {
					this._append(pre + "[Array object]");
					arguments[key].forEach(function(item) { self._append.bind(self)(pre + "- " + JSON.stringify(item)); });
				}
				else if(typeof(arguments[key]) === "object") {
					this._log(pre + "&emsp;", arguments[key]);
				}
				else 
					this._append(pre + JSON.stringify(arguments[key]));
			}
	},
	log: function() {
		if(!this._elem) 
			for(var key in arguments)
				this._lazy.push(arguments[key]);
		else {
			this._elem.classList.add("open");
			this._log("", arguments);
		}
	}
};

window.addEventListener("load", function() {
	var div = document.createElement("div");
	div.classList.add("console");
	div.classList.add("open");
	//div.addEventListener("click", function(e) { e.stopPropagation(); });
	console._elem = div;
	document.body.appendChild(div);
	console.log.apply(console, console._lazy);
});

document.body.addEventListener("click", function() { console._elem.classList.remove("open"); });
	

