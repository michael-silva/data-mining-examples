

function readAthletesData(callback) {
	var athletes = [];
	FileReader.readText('../data/athletesTrainingSet.txt', function(text) {
		var lines = text.split("\n");
		for(var i = 1; i < lines.length; i++) {
			var temp = lines[i].split("\t");
			athletes.push([temp[1], [temp[2], temp[3]], temp[0]]);
		}
		
		callback(athletes);
	});
}

function readAthletesTestData(callback) {
	var athletes = [];
	FileReader.readText('../data/athletesTestSet.txt', function(text) {
		var lines = text.split("\n");
		for(var i = 1; i < lines.length; i++) {
			var temp = lines[i].split("\t");
			athletes.push([temp[1], [temp[2], temp[3]], temp[0]]);
		}
		
		callback(athletes);
	});
}

function main() {
    console.log("KNN Classifier");
	
	readAthletesData(function(data) {
		var classifier = new Classifier(data, 1, similarity.manhattan);
		readAthletesTestData(function(data) {
			var results = {};
			for(var i in data) {
				if(!data[i][0]) continue;
				var c = classifier.classify(data[i][1]);
				if(!results[c]) results[c] = {};
				results[c][data[i][0]] = (results[c][data[i][0]] || 0) + 1;
			}
			
			var tab = 0;
			var line = "         ";
			for(var c in results) 
				line += c + " ";
			
			console.log(line);
			for(var c1 in results) {
				line = c1 + " ";
				for(var c2 in results) line += (results[c1][c2] || 0) + "    ";
				console.log(line);
			}
			
		});
	});
	
	//console.log("Hello world");
	//console.log({ teste: "hhjdjjdj" });
};

window.addEventListener("load", main);