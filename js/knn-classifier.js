(function(w, undefined) {
	
/*
 * Util functions
 */
function sum(data, operation) {
	var result = 0;
	if(Array.isArray(data)) {
		if(data.length == 0) return 0;
		data.forEach(function(v, i) {
			if(operation) result += operation(v, i, result);
			else result += v; 
		});
	}
	else {
		for(var key in data) {
			if(operation) result += operation(data[key], key, result);
			else result += data[key]; 
		};
	}
	return result;
}

function orderByIndex(data, i, dir) {
	dir = (dir == 'desc') ? -1 : 1;
	return data.sort(function(a, b) {
		if(a[i] > b[i]) return 1 * dir;
		else if(a[i] < b[i]) return -1 * dir;
		return 0;
	});
}

/*
 * Main function
 */
function Classifier(data, col, distance) {
	var indexes = {};
	
	function init() {
		computeIndexes(col);
		
		for(var i in data[0][col])
			normalizeColumn(col, i);
	}

	function getMedian(data) {
		if(data.length % 2 == 0) {
			var i = Math.ceil(data.length / 2);
			var j = Math.floor(data.length / 2);
			return (data[i] + data[j]) / 2;
		}
		else {
			return data[Math.floor(data.length / 2)];
		}
	}

	function getStandardDeviation(data, median) {
		return sum(data, function(v) { return Math.abs(v - median); }) / data.length;
	}
	
	function computeIndexes(key) {
		var values = [];
		for(var i in data) {
			for(var j in data[i][key]) {
				if(!values[j]) values[j] = [];
				values[j].push(data[i][key][j]);
			}
		}
		
		for(var i in values) {
			var med = getMedian(values[i]);
			var dev = getStandardDeviation(values[i], med);
			indexes[i] = { median: med, deviation: dev };
		}
	}
	
	
	function normalizeColumn(col, j) {
		var med = indexes[j].median;
		var sd = indexes[j].deviation;
		for(var i in data) {
			data[i][col][j] = (data[i][col][j] - med) / sd;
		}
	}
	
	function normalizeVector(vector) {
		var results = [];
		for(var i in vector) {
			var med = indexes[i].median;
			var sd = indexes[i].deviation;
			results[i] = (vector[i] - med) / sd;
		}
		return results;
	}
	
	function nearestNeighbor(vec, n) {
		var results = [];
		for(var k in data)
			results.push([k, distance(vec, data[k][col])]);
		
		var sorted = orderByIndex(results, 1, 'desc');
		return n > 0 ? sorted.slice(0, n) : sorted;
	}
	
	function classify(vec) {
		var nearest = nearestNeighbor(normalizeVector(vec), 3);
		var cats = {};
		for(var n in nearest)
		 	cats[data[nearest[n][0]][0]] = (cats[data[nearest[n][0]][0]] || 0) + 1;
		var c = { count: 0 };
		for(var k in cats) 
			if(cats[k] > c.count) c = { cat: k, count: cats[k] };
		return c.cat;
	}
	
	init();
	return {
		nearestNeighbor: nearestNeighbor,
		classify: classify
	};
}

function TextClassifier(data, col, distance) {
	var indexes = {};
	
	function init() {
		computeIndexes(col);
		
		//for(var i in data[0][col])
		//	normalizeColumn(col, i);
	}
	
    function getMedian(data) {
        if(data.length % 2 == 0) {
            var i = Math.ceil(data.length / 2);
            var j = Math.floor(data.length / 2);
            return (data[i] + data[j]) / 2;
        }
        else {
            return data[Math.floor(data.length / 2)];
        }
    }

    function getStandardDeviation(data, median) {
        return sum(data, function(v) { return Math.abs(v - median); }) / data.length;
    }

	function computeIndexes(key) {
		var values = [];
		for(var i in data) {
			for(var j in data[i][key]) {
				if(!values[j]) values[j] = [];
				values[j].push(data[i][key][j]);
			}
		}
		
		for(var i in values) {
			var med = getMedian(values[i]);
			var dev = getStandardDeviation(values[i], med);
			indexes[i] = { median: med, deviation: dev };
		}
	}
	
	
	function normalizeColumn(col, j) {
		var med = indexes[j].median;
		var sd = indexes[j].deviation;
		for(var i in data) {
			data[i][col][j] = (data[i][col][j] - med) / sd;
		}
	}
	
	function normalizeVector(vector) {
		var results = [];
		for(var i in vector) {
			var med = indexes[i].median;
			var sd = indexes[i].deviation;
			results[i] = (vector[i] - med) / sd;
		}
		return results;
	}
	
	function findNearests(vec, n) {
		var nearests = nearestNeighbor(vec, n);
		var results = [];
		for(let i in nearests)
		 	results.push(data[nearests[i][0]]);
        return results;
	}

    function nearestNeighbor(vec, n) {
		var results = [];
		for(var k in data)
			results.push([k, distance(vec, data[k][col])]);
		
		var sorted = orderByIndex(results, 1, 'desc');
		return n > 0 ? sorted.slice(0, n) : sorted;
	}
	
	function classify(vec) {
		//var nearest = nearestNeighbor(normalizeVector(vec), 3);
		var nearest = nearestNeighbor(vec, 3);
		var cats = {};
		for(var n in nearest)
		 	cats[data[nearest[n][0]][0]] = (cats[data[nearest[n][0]][0]] || 0) + 1;
		var c = { count: 0 };
		for(var k in cats) 
			if(cats[k] > c.count) c = { cat: k, count: cats[k] };
		return c.cat;
	}
	
	init();
	return {
		findNearests: findNearests,
		classify: classify
	};
}

w.Classifier = Classifier;
w.TextClassifier = TextClassifier;
})(window);