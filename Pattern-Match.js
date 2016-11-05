var Transform = require('stream').Transform;
var inherits = require('util').inherits;
var underscore = require('underscore');
var program = require('commander');
var fs = require('fs');
var sleep = require('sleep');

if (!Transform) {
    Transform = require('readable-stream/transform');
}

function PatternMatch(pattern) {
    this.pattern = pattern;
    Transform.call( this, { objectMode: true });
}

inherits(PatternMatch, Transform);


//This takes the input pattern match character and inputs it into this function to transform the input
PatternMatch.prototype._transform = function (substr, encoding, nextStr) { 
    var data = substr.toString();
    var lines = data.split(this.pattern);
    if (lines.length === 1) {
        this.characters = (this.characters || "") + lines[0];
    } else {
        this.characters = lines[lines.length - 1];
        lines.splice(lines.length - 1);
        var that = this;
        underscore.each(lines, function (line) {
            that.push(line);
        });
        nextStr();    
    }
}

//Specifies the type of command line input it is expecting
program .option('-p, --pattern <pattern>', 'Input Pattern such as . /n ,')
program .parse(process.argv);

//Reads in the input text file
var inputStream = fs.createReadStream("input.txt");
var patternStream = inputStream.pipe(new PatternMatch(program.pattern));

//Finds the matches
var matches = [];
patternStream.on('readable', function()
    {	
	  var substr; 
	  while ((substr = patternStream.read()) !== null) {
          matches.push(substr);
    }
});

//Console Input/Output
patternStream.on('end', function() {
        console.log('*******************');
        console.log('INPUT');
        console.log('*******************');
    fs.readFile('input.txt', 'utf-8', function(err, data) {
        if (err) {
            console.log('ERROR FOUND, EXITING');
            return console.log(err);
        }
        console.log(data);
        console.log('*******************');
        console.log('OUTPUT');
        console.log('*******************');
        console.log(matches);
    });
});
