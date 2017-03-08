var FileReader = {
    _read: function(file, callback, format)
    {
        if(Array.isArray(file)) {
            var results = [],
                current = 0,
                readItem = function(result) {
                    results[current] = (typeof(format) == "function") ? format(result) : result ;
                    current++;
                    if(current < file.length)
                        this._read(file[current], readItem.bind(this));
                    else if(typeof(callback) == "function")
                        callback(results);
                };
            this._read(file[current], readItem.bind(this));
        }
        else {
            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", file, true);
            rawFile.onreadystatechange = function ()
            {
                if(rawFile.readyState === 4)
                {
                    if(rawFile.status === 200 || rawFile.status == 0)
                    {
                        if(typeof(callback) == "function")
                            callback((typeof(format) == "function") ? format(rawFile) : rawFile);
                    }
                }
            };
            rawFile.send(null);
        }
    },
    readText: function(file, callback)
    {
        this._read(file, callback, function(response) {
            return response.responseText;
        });
    },
    readXml: function(file, callback) {
        this._read(file, callback, function(response) {
            return (response && response.responseText) 
                ? new DOMParser().parseFromString(response.responseText, "text/xml") : '';
        })
    },
    readJson: function(file, callback) {
        this._read(file, callback, function(response) {
             return (response && response.responseText) 
                ? JSON.parse(response.responseText) : '';
        })
    }
};