var users  =  {
	"Angelica": {"Blues Traveler":  3.5,  "Broken Bells":  2.0, "Norah Jones":  4.5,  "Phoenix":  5.0, "Slightly Stoopid": 1.5, "The Strokes": 2.5, "Vampire Weekend": 2.0}, 
	"Bill":     {"Blues Traveler": 2.0, "Broken Bells": 3.5, "Deadmau5": 4.0, "Phoenix": 2.0, "Slightly Stoopid": 3.5, "Vampire Weekend": 3.0},  
	"Chan":     {"Blues Traveler": 5.0, "Broken Bells": 1.0, "Deadmau5": 1.0, "Norah Jones": 3.0, "Phoenix": 5, "Slightly Stoopid": 1.0}, 
	"Dan":      {"Blues Traveler": 3.0, "Broken Bells": 4.0, "Deadmau5": 4.5, "Phoenix": 3.0, "Slightly Stoopid": 4.5, "The Strokes": 4.0, "Vampire Weekend": 2.0},       
	"Hailey":   {"Broken Bells": 4.0, "Deadmau5": 1.0, "Norah Jones": 4.0, "The Strokes": 4.0, "Vampire Weekend": 1.0}, 
	"Jordyn":   {"Broken Bells": 4.5, "Deadmau5": 4.0, "Norah Jones": 5.0, "Phoenix": 5.0, "Slightly Stoopid": 4.5, "The Strokes": 4.0, "Vampire Weekend": 4.0}, 
	"Sam":      {"Blues Traveler": 5.0, "Broken Bells": 2.0, "Norah Jones": 3.0, "Phoenix": 5.0, "Slightly Stoopid": 4.0,  "The Strokes": 5.0},   
	"Veronica": {"Blues Traveler": 3.0, "Norah Jones": 5.0, "Phoenix": 4.0,  "Slightly Stoopid": 2.5, "The Strokes":  3.0}
};

var users2 = {
	"Amy": {"Taylor Swift": 4, "PSY": 3, "Whitney Houston": 4}, 
	"Ben": {"Taylor Swift": 5, "PSY": 2}, 
	"Clara": {"PSY": 3.5, "Whitney Houston": 4}, 
	"Daisy": {"Taylor Swift":  5,  "Whitney Houston":  3}
};

var users3 = {
	"David": {"Imagine Dragons": 3, "Daft Punk": 5, "Lorde": 4, "Fall Out Boy": 1}, 
	"Matt":  {"Imagine Dragons": 3, "Daft Punk": 4, "Lorde": 4, "Fall Out Boy": 1}, 
	"Ben":   {"Kacey Musgraves": 4, "Imagine Dragons": 3, "Lorde": 3, "Fall Out Boy": 1}, 
	"Chris": {"Kacey Musgraves": 4, "Imagine Dragons": 4, "Daft Punk": 4, "Lorde": 3, "Fall Out Boy": 1}, 
	"Tori":  {"Kacey Musgraves": 5, "Imagine Dragons": 4, "Daft Punk":  5,  "Fall Out Boy":  3}
};

function getMovies(text) {
	var lines = text.split('\n');
	var data = {};
	for(let i = 0; i < lines.length; i++) {
		var parts = lines[i].split(',');
		data[parts[0]] = { title: parts[1], tags: parts[2] };
	}
	return data;
}

function getRatings(text) {
	var lines = text.split('\n');
	var data = {};
	for(let i = 0; i < lines.length; i++) {
		var parts = lines[i].split(',');
		if(!data[parts[0]]) data[parts[0]] = {};
		data[parts[0]][parts[1]] = +parts[2];
	}
	return data;
}

function main() {
	console.log("Collaborative Filtering");
	console.log("User Based Collaborative Filtering");

	var knn = new KnnRecommender(users, 3, similarity.pearson);
	var k2 = "Hailey";
	console.log(k2)
	console.log('Recommendations');
	console.log(knn.recommend(k2));
	console.log('Nearest Neighbors');
	console.log(knn.nearestNeighbor(k2, 3));

	console.log("Item Based Collaborative Filtering");
	var ac = new AdjustedCosineRecommender(users3, 0, 5);
	console.log(ac.recommend('Ben', 3));

	var key = "Clara";
	console.log(key);
	var so = new SlopeOneRecommender(users2);
	so.computeDeviations();
	console.log('Recommendations');
	console.log(so.recommend(users2[key], 3))
	
	FileReader.readText(['../data/movielens/ratings.csv', '../data/movielens/movies.csv'], function(text) {
		var ratings = getRatings(text[0]);
		var movies = getMovies(text[1]);
		var userId = '1';

		console.log("Movielens ratings");
		console.log("User Based Collaborative Filtering");
		var mknn = new KnnRecommender(ratings, 5, similarity.cosine);
		var views = [];
		for(let r in ratings[userId]) views.push(movies[r].title);
		console.log(views);
		console.log('Recommendations');
		console.log(mknn.recommend(userId, 5).map(r => movies[r[0]].title));
		console.log('Nearest Neighbors');
		console.log(mknn.nearestNeighbor(userId, 5));

		console.log("Item Based Collaborative Filtering");
		var mso = new SlopeOneRecommender(ratings);
		mso.computeDeviations();
		console.log('Recommendations');
		console.log(mso.recommend(ratings[userId], 5).map(r => movies[r[0]].title));
	});
	
}


window.addEventListener("load", main);