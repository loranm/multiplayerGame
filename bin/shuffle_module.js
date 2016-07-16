var capitalString;
var splitter = [];
var mixer = [];

var splitString = function(err, data) {
    if (err) {
        throw err;
    } else {
      splitter=[]
        for (var i = 0; i < data.length; i++) {
            splitter.push(data.charAt(i));
        };
    };
};

var completeArray = function(err, data) {
    if (err) {
        throw err
    } else {
        var size = 16-splitter.length;
        var max = 90;
        var min = 65;
        for (var i = 0; i < size; i++) {
          var randChar = Math.floor(Math.random() * (max - min + 1)) + min;
          splitter.push(String.fromCharCode(randChar));
        };
    };
};

var shuffleArray = function(err, data){
  if (err){
    throw err
  }else{
    var counter = data.length;
    while (counter > 0){
      var index = Math.floor(Math.random() * counter);
      counter--;
      var temp = data[counter];
      data[counter] = data[index];
      data[index] = temp;
    }
    return data;
  }
}

var usingCompleteArray = function(callback, data){
    capitalString = data;
    splitString(null,capitalString);
    callback(null,splitter);
};



var usingShuffle = function(callback, data){
  var country = data;
  usingCompleteArray(completeArray, country);
  callback(null, splitter);
  return splitter;

};



// exports.capitalString = capitalString
exports.shuffleArray = shuffleArray;
exports.usingShuffle = usingShuffle;
