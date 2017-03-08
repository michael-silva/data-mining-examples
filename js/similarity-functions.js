(function(w, undefined) {

/* 
 * Distance metric functions
 */
let similarity = {
	pearson: function(v1, v2) {
		var n = 0;
		var sum1 = 0, 
			sum2 = 0, 
			sumsq1 = 0,
			sumsq2 = 0,
			psum = 0;
			
		for(var e in v1) {
			if(v2[e]) {
				n++;
				sum1 += v1[e];
				sum2 += v2[e];
				
				sumsq1 += Math.pow(v1[e], 2);
				sumsq2 += Math.pow(v2[e], 2);
				
				psum += v1[e] * v2[e];
			}
		};
		
		var num = psum - (sum1 * sum2 / n);
		var den = Math.sqrt((sumsq1 - Math.pow(sum1,2) / n)
			* (sumsq2 - Math.pow(sum2,2) / n));
		
		if(den==0) return 0;
		return num / den;
	},
	euclidean: function(v1, v2) {
		return sum(v1, function(v, i) { return v2[i] ? Math.pow(v - v2[i], 2) : 0; });
	},
	manhattan: function(v1, v2) {
		return sum(v1, function(v, i) { return v2[i] ? Math.abs(v - v2[i]) : 0; });
	},
	cosine: function(v1, v2) {
		var sumsq1 = 0,
			sumsq2 = 0,
			psum = 0;
		
		var keys = [];
		for(var k in v1) keys.push(k);
		for(var k in v2) if(!v1[k]) keys.push(k);
		
		for(var i = 0; i < keys.length; i++) {
			var e = keys[i];
			sumsq1 += Math.pow(v1[e] || 0, 2);
			sumsq2 += Math.pow(v2[e] || 0, 2);
				
			psum += (v1[e] || 0) * (v2[e] || 0);
		};
		
		var den = Math.sqrt(sumsq1) * Math.sqrt(sumsq2);
		
		return psum / den;
	},
};

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

w.similarity = similarity;
})(window);
