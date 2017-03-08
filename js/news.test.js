function readXmlNews(files, callback) {
    let news = {},
        current = 0,
        readFn = function(xml) {
            var items = [];
            xml.querySelectorAll('item').forEach(item => {
                items.push({
                    title: item.querySelector('title').textContent,
                    description: item.querySelector('description').textContent.replace(/<[^>]*>/gi, '').trim()
                });
            });
            let category = xml.querySelector('title').textContent.split('> ')[1];
            news[category] = items;
            current++;
            if(current < files.length)
                FileReader.readXml(files[current], readFn)
            else if(typeof(callback) == "function")
                callback(news);
        };

    FileReader.readXml(files[current], readFn);
}

function tokenizeNews(news) {
    let words = [];
    news.forEach(item => words.push(Stemmer.stemming(Tokenizer.from(`${item.title} ${item.description}`))));
    return words;
}

function removeStopWords(tokens) {
    let count = 0, total = {};
    for(let k1 in tokens) {
        for(let i = 0; i < tokens[k1].length; i++) {
            for(let k2 in tokens[k1][i]) {
                if(!total[k2]) {
                    count++;
                    total[k2] = 0;
                }
                total[k2] += tokens[k1][i][k2]
            }
        }
    }

    let percent = count * 0.01;
    for(let key in total) {
        if(total[key] > percent) {
            for(let k in tokens) 
                for(let i = 0; i < tokens[k].length; i++)
                    delete tokens[k][i][key];
         }
    }
}

function buildArray(tokens) {
    let length = 0, index = {}, data = [];
    for(let k1 in tokens) {
        for(let i = 0; i < tokens[k1].length; i++) {
            for(let k2 in tokens[k1][i]) {
                if(!index[k2]) {
                    index[k2] = length;
                    length++;
                }
            }
        }
    }

    for(let k1 in tokens) {
        for(let i = 0; i < tokens[k1].length; i++) {
            let temp = [];
            for(let k2 in tokens[k1][i]) {
                temp[index[k2]] = tokens[k1][i][k2];
            }
            data.push([k1, temp, i]);
        }
    }

    return { index: index, data: data };
}

function toArray(tokens, index) {
    var array = [];
    for(let key in tokens) {
        if(index[key])
            array[index[key]] = tokens[key];
    }

    return array;
}


function main() {
    var path = '../data/g1-rss/', 
        files = ['carros.xml', 'ciencia-saude.xml', 'economia.xml', 'educacao.xml', 'musica.xml', 'politica.xml', 'pop-arte.xml', 'tecnologia-games.xml', 'turismo-viagem.xml'];
    
    readXmlNews(files.map(f => `${path}${f}`), function(news) {
        var tokens = {};
        for(var category in news)
            tokens[category] = tokenizeNews(news[category]);

        removeStopWords(tokens);
        //console.log(tokens);
        var table = buildArray(tokens);
        //console.log(table);

        var text = 'Filho de pedreiro e doméstica passa em 1º lugar em engenharia na USP Apoio dos pais foi essencial para realização de sonho, diz estudante. Renan Bergamaschi de Morais estudava quatro horas por dia em Bariri.'
        var words = Tokenizer.from(text);
        var stemms = Stemmer.stemming(words);
        var array = toArray(stemms, table.index);

        var classifier = new TextClassifier(table.data, 1, similarity.cosine);
        var nearests = classifier.findNearests(array, 3);
        var clas = classifier.classify(array);
        var nears = [];
        for(let n in nearests) 
            nears.push(news[nearests[n][0]][nearests[n][2]]);

        console.log(text);
        console.log(nearests);
        console.log(nears);
        console.log(clas);
    });
}

window.addEventListener("load", main);
