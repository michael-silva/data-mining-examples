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
 * Main functions
 */
//User-based filtering
//Simple but imprecise and slow to big datasets
function KnnRecommender(data, k, metric) {
	var _db = data,
		_k = k || 1,
		_distance = metric || similarity.pearson;
		
	function nearestNeighbor(key, n) {
		var data = _db;
		var results = [];
		for(var k in data)
			if(k != key) results.push([k, _distance(data[key], data[k])]);
		
		var sorted = orderByIndex(results, 1, 'desc');
		return n > 0 ? sorted.slice(0, n) : sorted;
	}

	function recommend(key, n) {
		var n = n || 3;
	
		var results = [];
		var nearests = nearestNeighbor(key, _k);
		var totalDistance = sum(nearests, function(v) { return v[1]; });
		var weight = 0, index = 0;
		for(var i = 0; i < nearests.length; i++) {
			weight = nearests[i][1] / totalDistance;
			for(var nkey in _db[nearests[i][0]])
				if(!_db[key][nkey]) {
					index = results.findIndex(function(r) { return r[0] == nkey; });
					if(index == -1)
						results.push([nkey, _db[nearests[i][0]][nkey] * weight]);
					else
						results[index][1] += (_db[nearests[i][0]][nkey] * weight);
				}
		}
	
		return orderByIndex(results, 1, 'desc').slice(0, n);
	}
	
	return {
		recommend: recommend,
		nearestNeighbor: nearestNeighbor
	};
}

//Item-based filtering with great performance
function SlopeOneRecommender(data) {
	var comps = {};
	
	function computeDeviations() {
		for(var k1 in data) {
			for(var k2 in data[k1]) {
				if(!comps[k2]) 
					comps[k2] = { };
				
				for(var k3 in data[k1]) {
					if(k2 != k3) {
						if(!comps[k2][k3])
							comps[k2][k3] = { deviation: 0, freq: 0 };
						comps[k2][k3].deviation += data[k1][k2] - data[k1][k3];
						comps[k2][k3].freq += 1;
					}
				}
			}
		}
		
		for(var k1 in comps)
			for(var k2 in comps[k1])
				comps[k1][k2].deviation /= comps[k1][k2].freq;
	}
	
	function recommend(ratings, n) {
		var recommendations = {};
		
		for(var k1 in ratings) {
			for(var k2 in comps) {
				if(!ratings[k2] && comps[k2][k1]) {
					if(!recommendations[k2])
						recommendations[k2] = { value: 0, freq: 0 };
					var freq = comps[k2][k1].freq;
					recommendations[k2].value += ((comps[k2][k1].deviation + ratings[k1]) * freq);
					recommendations[k2].freq += freq;
				}
			}
		}
		
		var recs = [];
		for(var r in recommendations) 
			recs.push([r, recommendations[r].value / recommendations[r].freq]);
		
		return orderByIndex(recs, 1, 'desc').slice(0, n || 3);
	}
	
	return {
		computeDeviations: computeDeviations,
		recommend: recommend
	};
}

//Item-based filtering with great performance optimized
function SlopeOneRecommenderOpt(objs) {
	var keys = [];
	var data = {};
	
	for(var k1 in objs) {
		var i = 0;
		data[k1] = {};
		for(var k2 in objs[k1]) {
			i = keys.indexOf(k2);
			if(i == -1) {
				i = keys.length;
				keys.push(k2);
			}
			data[k1][i] = objs[k1][k2];
		}
	}

	var deviations = new Array(keys.length);
	var frequencies = new Array(keys.length);

	function computeDeviations() {
		var i = 0, j = 0;
		for(var k1 in data) {
			for(var i in data[k1]) {
				if(!deviations[i]) {
					deviations[i] = new Array(keys.length);
					frequencies[i] = new Array(keys.length);
				}

				for(var j in data[k1]) {
					if(i != j) {
						deviations[i][j] = (deviations[i][j] || 0) + data[k1][i] - data[k1][j];
						frequencies[i][j] = (frequencies[i][j] || 0) + 1;
					}
				}
			}
		}
		
		for(i = 0; i < keys.length; i++)
			for(j = 0; j < keys.length; j++)
				deviations[i][j] /= frequencies[i][j];
	}
	
	function recommend(ratings, n) {
		var recommendations = {};
		
		for(var k1 in ratings) {
			var j = keys.indexOf(k1);
			for(var i = 0; i < keys.length; i++) {
				var k2 = keys[i];
				if(!ratings[k2] && deviations[j][i]) {
					if(!recommendations[k2])
						recommendations[k2] = { value: 0, freq: 0 };
					var freq = frequencies[j][i];
					recommendations[k2].value += ((deviations[j][i] + ratings[k1]) * freq);
					recommendations[k2].freq += freq;
				}
			}
		}
		
		var recs = [];
		for(var r in recommendations) 
			recs.push([r, recommendations[r].value / recommendations[r].freq]);
		
		return orderByIndex(recs, 1, 'desc').slice(0, n || 3);
	}
	
	return {
		computeDeviations: computeDeviations,
		recommend: recommend
	};
}

//item-based filtering, but performance to large datasets is slow
function AdjustedCosineRecommender(data, min, max) {
	var keys = [],
		normalized = [];

	function similarity(v1, v2, ratings) {
		var sumsq1 = 0,
			sumsq2 = 0,
			psum = 0;
		
		var averages = {};
		for(var r in ratings) {
			var n = 0;
			averages[r] = sum(ratings[r], function(v) { ++n; return v; }) / n;
		}
		
		var keys = [];
		for(var r in ratings) {
			if(ratings[r][v1] && ratings[r][v2]) {
				sumsq1 += Math.pow(ratings[r][v1] - averages[r], 2);
				sumsq2 += Math.pow( ratings[r][v2] - averages[r], 2);
				
				psum += (ratings[r][v1] - averages[r]) * (ratings[r][v2] - averages[r]);
			}
		}
		
		var den = Math.sqrt(sumsq1) * Math.sqrt(sumsq2);
		return psum / den;
	}
	
	function invert(data) {
		var results = {};
		for(var k1 in data) {
			for(var k2 in data[k1]) {
				if(!results[k2]) results[k2] = {};
				results[k2][k1] = data[k1][k2];
			}
		}
		return results;
	}
	
	function normalize(data, min, max) {
		min = min || 0;
		max = max || 0;
		if(min == 0 && max == 0) {
			for(var k1 in data) {
				for(var k2 in data[k1]) {
					var temp = data[k1][k2];
					if(temp > max) max = temp;
					if(temp < min) min = temp;
				}
			}
		}
	
		var results = {};
		for(var k1 in data) {
			results[k1] = {};
			for(var k2 in data[k1]) {
				results[k1][k2] = (2 * (data[k1][k2] - min) - (max - min)) / (max - min);
			}
		}
		return results;
	}
	
	function predict(ratings, item, data) {
		var psum = sum(ratings, function(r, i) { return r * similarity(item, i, data); });
		var s = sum(ratings, function(r, i) { return Math.abs(similarity(item, i, data)); });
		//console.log(psum, s);
		return psum / s;
	}
	
	function recommend(key, n) {
		var results = [];
		for(var i = 0; i < keys.length; i++)
			if(!normalized[key][keys[i]])
				results.push([keys[i], predict(normalized[key], keys[i], data)]);
				
		return orderByIndex(results, 1, 'desc').slice(0, n || 3);
	}

	function init() {
		for(var k1 in data) {
			for(var k2 in data[k1])
				if(keys.indexOf(k2) == -1)
					keys.push(k2);
		}

		normalized = normalize(data, min, max);
	}
	
	init();
	return {
		recommend: recommend
	};
}

w.SlopeOneRecommender = SlopeOneRecommenderOpt;
w.AdjustedCosineRecommender = AdjustedCosineRecommender;
w.KnnRecommender = KnnRecommender;
})(window);
