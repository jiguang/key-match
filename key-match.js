/*
 * @desc: 自动问答系统主逻辑
 * @author: jiguang
 * @mail: jiguang1984#gmail.com
 * @date: 2012-10-22
 */
var KeyMatch = function(opt){

    // init setting
    this.opt = opt || {};
    this.sort = opt.sort || false; // for high performance, DO NOT SORT
    this.unique = opt.unique || true;  // is keywords unique
    this.debug = this.opt.debug || false;  // is debug
    this.matchedLimit = this.opt.matchedLimit || 0;  // 0: no limit, [num] limit

    // keywords and matches
    this.keywords = [];
    this.matches = [];

    // initial keywords regex
    this.keywordsReg;
    this.matchedKeywordsReg;

    // matched results
    this.matched = [];

    // 'best' matched, which has the most matched keywords number
    this.bestMatched = '';

    // is data loaded
    this.isLoaded = false;

    // load data
    this.load = function(keywords/*Array*/, matches/*Array*/){

        if(!keywords || !matches){
            this.log('No data received.');
            return false;
        }

        if((keywords instanceof Array) && (matches instanceof Array)){

            if(keywords.length === 0 || matches.length === 0){
                this.log('Arguments can not be empty Array.');
                return false;
            }else{

                // load
                this.keywords = keywords;
                this.matches = matches;

                // contain all keywords
                this.keywordsReg = new RegExp('('+this.keywords.join('|')+')', 'g');
                this.isLoaded = true;

                return true;
            }
        }else{
            this.log('Arguments must be [Array].');
            return false;
        }
    };

    // match
    this.match = function(str/*String*/){

        if(!str || str.replace(/(^\s*|\s*$)/,'') === ''){
            this.log('No input string.');
            return {
                'status': 0 // has match(es):1, no match:0
            };
        }

        // if data loaded
        if(this.isLoaded){

            // clear history
            this.matched = [];
            this.matchedKeywords = [];

            // if there is some keywords in the input string
            if(this.matchedKeywords = str.match(this.keywordsReg)){

                this.log('Input string matched keywords:'+ this.matchedKeywords.join('|'));

                // contain all keywords in the input string
                this.matchedKeywordsReg = new RegExp('('+this.matchedKeywords.join('|')+')', 'g');

                // find all matches
                for(var i = 0, j = this.matches.length; i<j; i++){

                    // test every string in matches Array
                    if(this.currentMatchedKeywords = this.matches[i].match(this.matchedKeywordsReg)){

                        // remove duplicate keywords
                        if(this.unique){
                            this.currentMatchedKeywords.sort();

                            for ( var k = 1; k < this.currentMatchedKeywords.length; k++ ) {
                                if ( this.currentMatchedKeywords[k] === this.currentMatchedKeywords[ k - 1 ] ) {
                                    this.currentMatchedKeywords.splice( k--, 1 );
                                }
                            }
                        }
                        this.log('Current matched keywords:'+ this.currentMatchedKeywords.join('|'));

                        // init 'best' matched
                        this.bestMatched = this.matches[i];

                        // save all sorted matches
                        if(this.sort){
                            this.matched.push({
                                "content": this.matches[i],
                                "matchedKeywordsCount": this.currentMatchedKeywords.length
                            });
                        }else{
                            this.matched.push(this.matches[i]);
                        }

                        // input string which has the most matched keywords was the 'best' match
                        // CAN NOT distinguish two matches which have the same number of keywords
                        if(this.currentMatchedKeywords.length >= this.bestMatched.match(this.matchedKeywordsReg).length){
                            this.bestMatched = this.matches[i];
                        }
                    }
                }

                // sort matched Array by matched keywords count
                if(this.sort){
                    var matched = [];
                    this.matched = this.matched.sort(function(a, b){
                        return b.matchedKeywordsCount - a.matchedKeywordsCount;
                    });
                    for(var m = 0, n = this.matched.length; m < n; m++){
                        matched.push(this.matched[m].content);
                    }
                    this.matched = matched;
                }

                // match limit
                if(this.matchedLimit !== 0){
                    this.matched.length = this.matchedLimit;
                }

                // return value
                return {
                    'status': 1,   // has result:1, no result:0
                    'matched': this.matched,
                    'bestMatched': this.bestMatched
                };

            }else{
                this.log('No matches.');
                return {
                    'status': 0
                }
            }
        }else{
            this.log('Data not loaded');
            return {
                'status': 0
            }
        }
    };

    // log
    this.log = function(msg){
        if(this.debug && msg && typeof msg === 'string'){
            console.log('Log:', msg);
        }
    }
};