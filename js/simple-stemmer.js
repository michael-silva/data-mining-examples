var Tokenizer = {
    letters: '[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ\\$]', 
    numbers: '[0-9]+([-.,(][0-9])*',
    from: function(text) {
        let pattern = new RegExp(`${this.numbers}|${this.letters}+([-.,\(]${this.letters}+\\)?)*|\S+`, `gi`);
        text = text.match(pattern);
        return text;
    }
};

var Stemmer = {
    stemming: function(words) {
        let self = this,
            results = [];
        
        words.forEach((w, i) => {
            let key = w.replace('ã', 'a~').replace('õ', 'o~');
            let temp = self.step1(key);
            if(temp.length == key.length)
                temp = self.step2(key);
            if(temp.length == key.length) {
                temp = self.step3(key);
                temp = self.step4(key);
            }
            
            temp = self.step5(temp);
            results[i] = temp;
        });
        
        let tokens = {};
        results.forEach((w, i) => {
            let key = w.replace('a~', 'ã').replace('o~', 'õ');
            if(!key) return;
            if(!tokens[key]) tokens[key] = 1;
            else tokens[key]++; 
        });
        return tokens;
    },
    step1: function(token) {
        let suffixes = /(eza|ezas|ico|ica|icos|icas|ismo|ismos|ável|ível|ista|istas|oso|osa|osos|osas|amento|amentos|imento|imentos|adora|ador|aça~o|adoras|adores|aço~es|ante|antes|ância)$/i;
        token = token.replace(suffixes, '');
        token = token.replace(/logias?$/, 'log');
        token = token.replace(/ución|uciones$/, 'u');
        token = token.replace(/ências?$/, 'ente');
        token = token.replace(/(iv|as|ic|ad)amente$/, '');
        token = token.replace(/(ante|avel|ive)mente$/, '');
        token = token.replace(/(abil|ic|iv)idades?$/, '');
        token = token.replace(/at(ivos?|ivas?)$/, '');
        token = token.replace(/iras?$/, 'ir');
        return token;
    },
    step2: function(token) {
        let suffixes = /(íssemos|êssemos|ássemos|iríamos|eríamos|aríamos|iremos|eremos|aremos|ávamos|íramos|éramos|áramos|ísseis|ésseis|ásseis|iríeis|eríeis|aríeis|irmos|ermos|armos|íamos|áveis|ireis|íreis|ereis|éreis|areis|áreis|istes|estes|astes|isses|esses|asses|irdes|erdes|ardes|irias|erias|arias|ira~o|era~o|ara~o|issem|essem|assem|iriam|eriam|ariam|iras|imos|emos|amos|ámos|idos|ados|íeis|ires|eres|ares|avas|irás|eras|erás|aras|arás|idas|adas|indo|endo|ando|irem|erem|arem|avam|iram|eram|aram|irei|erei|arei|iste|este|aste|isse|esse|asse|iria|eria|aria|ira|eis|ais|ias|ido|ado|iam|ava|irá|era|erá|ara|ará|ida|ada|ou|iu|eu|is|es|as|ir|er|ar|em|am|ei|ia)$/i;
        token = token.replace(suffixes, '');
        return token;
    },
    step3: function(token) {
        token = token.replace(/ci/i, '');
        return token;
    },
    step4: function(token) {
        let residual = /(os|a|i|o|á|í|ó)$/i;
        token = token.replace(residual, '');
        return token;
    },
    step5: function(token) {
        let adjust = /(e|é|ê)$/i;
        token = token.replace(adjust, '');
        return token;
    }
}

