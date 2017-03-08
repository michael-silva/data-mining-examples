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
function BayesClassifier(prior, conditional) {
	prior = prior || {};
	conditional = conditional || {};
	function read(text, separator) {
		var parts,
			lines = text.split('\n'),
			counts = {};
		for(var i = 0; i < lines.length; i++) {
			if(!lines[i]) continue;
			parts = lines[i].split(separator),
			prior[parts[0]] = (prior[parts[0]] || 0) + 1;
			
			if(!counts[parts[0]]) counts[parts[0]] = {};
			for(var j = 1; j < parts.length; j++) {
				counts[parts[0]][parts[j]] = (counts[parts[0]][parts[j]] || 0) + 1;
			}
		}
		
		for(var key in counts) {
			if(!conditional[key]) conditional[key] = {};
			for(var attr in counts[key])
				conditional[key][attr] = counts[key][attr] / prior[key];
		}
		for(var key in prior) prior[key] /= lines.length;
		console.log(prior, conditional);
	}
	
	function classify(vector) {
		var results = [];
		for(let category in prior) {
			var prob = prior[category];
			var col = 1;
			for(var i = 0; i < vector.length; i++) {
				let attr = vector[i];
				if(!conditional[category][col][attr]) prob = 0; 
				else {
					prob *= conditional[category][col][attr];
					col += 1;
				}
			}
			results.push([prob, category]);
		}
		return orderByIndex(results,0, 'desc')[0];
	}
	
	return {
		classify: classify,
		read: read
	};
}

w.BayesClassifier = BayesClassifier;
	
})(window);


var data = {
	'Person 1': ['PC', 'Android'],
	'Person 2': ['PC', 'Android'],
	'Person 3': ['PC', 'Android'],
	'Person 4': ['PC', 'iPhone'],
	'Person 5': ['Mac', 'Android'],
	'Person 6': ['Mac', 'Android'],
	'Person 7': ['Mac', 'iPhone'],
	'Person 8': ['Mac', 'iPhone'],
	'Person 9': ['Mac', 'iPhone'],
	'Person 10': ['Mac', 'iPhone']
};

var prior =  {'i500':  0.6,  'i100':  0.4};
var conditional = {'i500': {1: {'appearance':  0.3333333333333,  'health':  0.4444444444444, 'both':  0.2222222222222}, 2: {'sedentary':  0.2222222222222,  'moderate':  0.333333333333, 'active':  0.4444444444444444}, 3: {'moderate':  0.333333333333,  'aggressive':  0.66666666666}, 4: {'no':  0.3333333333333333,  'yes':  0.6666666666666666}}, 'i100': {1: {'appearance':  0.333333333333,  'health':  0.1666666666666, 'both':  0.5}, 2: {'sedentary':  0.5,  'moderate':  0.16666666666666, 'active':  0.3333333333333}, 3: {'moderate':  0.83333333334,  'aggressive':  0.166666666666}, 4: {'no':  0.6666666666666,  'yes':  0.3333333333333}}};

function len(data) {
	var count = 0;
	for(var d in data) count++;
	return count;
}

function countIndex(key, j) {
	var count = 0;
	for(var d in data) { 
		if(data[d][j] == key) count++;
	}
	return count;
}

function probIndex(c, i) {
	return countIndex(c, i) / len(data);
}

function equals(a1, a2) {
	return a1.length==a2.length && a1.every(function(v,i) { return v === a2[i]; });
}

function countArray() {
	var count = 0;
	for(var d in data) { 
		if(equals(data[d], arguments)) count++;
	}
	return count;
}

function probArray() {
	return countArray.apply(this, arguments) / len(data);
}

function prob(a, array) {
	console.log(a, array);
	return probArray(array[0], a) / probIndex(a, 0);
}

function main() {
	
	var bc = new BayesClassifier(prior, conditional);
	console.log(bc.classify(['health', 'moderate', 'moderate', 'yes']));
	
	FileReader.readText('../data/house-votes/hv.csv', function(text) {
		console.log("readed");
		var bc2 = new BayesClassifier();
		bc2.read(text, ',');
	});

	//console.log("Hello world");
	//console.log({ teste: "hhjdjjdj" });
}

window.addEventListener("load", main);
