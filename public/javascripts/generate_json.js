var fs = require ('fs');

var countries=["ALBANIA","ARMENIA","AUSTRIA","AZERIBAIJAN","BELARUS","BELGIUM","BOSNIA AND HERZEGOVINA","BULGARIA","CROATIA","CYPRUS","CZECH REPUBLIC","DENMARK","ESTONIA","FINLAND","FRANCE","GEORGIA","GERMANY","GREECE","HUNGARY","ICELAND","IRELAND","ITALY","KAZAKHSTAN","LATVIA","LIECHTENSTEIN","LITHUANIA","LUXEMBOURG","MACEDONIA","MALTA","MOLDOVA","MONACO","MONTENEGRO","NETHERLANDS","NORWAY","POLAND","PORTUGAL","ROMANIA","RUSSIA","SAN MARINO","SERBIA","SLOVAKIA","SLOVENIA","SPAIN","SWEDEN","SWITZERLAND","TURKEY","UKRAINE","UNITED KINGDOM"];
var capitals=["TIRANA","YEREVAN","VIENNA","BAKU","MINSK","BRUSSELS","SARAJEVO","SOFIA","ZAGREB","NICOSIA","PRAGUE","COPENHAGEN","TALLINN","HELSINKI","PARIS","TBILISI","BERLIN","ATHENS","BUDAPEST","REYKJAVIK","DUBLIN","ROME","ASTANA","RIGA","VADUZ","VILNIUS","LUXEMBOURG","SKOPJE","VALLETTA","CHISINAU","MONACO","PODGORICA","AMSTERDAM","OSLO","WARSAW","LISBON","BUCHAREST","MOSCOW","SAN MARINO","BELGRADE","BRATISLAVA","LJUBLJANA","MADRID","STOCKHOLM","BERN","ANKARA","KYIV","LONDON"];
var flags=["https://upload.wikimedia.org/wikipedia/commons/3/36/Flag_of_Albania.svg","https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_Armenia.svg","https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_Austria.svg","https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Azerbaijan.svg","https://upload.wikimedia.org/wikipedia/commons/8/85/Flag_of_Belarus.svg","https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Belgium.svg","https://upload.wikimedia.org/wikipedia/commons/b/bf/Flag_of_Bosnia_and_Herzegovina.svg","https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Bulgaria.svg","https://upload.wikimedia.org/wikipedia/commons/1/1b/Flag_of_Croatia.svg","https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Cyprus.svg","https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_Czech_Republic.svg","https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Denmark.svg","https://upload.wikimedia.org/wikipedia/commons/8/8f/Flag_of_Estonia.svg","https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Finland.svg","https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg","https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_Georgia.svg","https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg","https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Greece.svg","https://upload.wikimedia.org/wikipedia/commons/c/c1/Flag_of_Hungary.svg","https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Iceland.svg","https://upload.wikimedia.org/wikipedia/commons/4/45/Flag_of_Ireland.svg","https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg","https://upload.wikimedia.org/wikipedia/commons/d/d3/Flag_of_Kazakhstan.svg","https://upload.wikimedia.org/wikipedia/commons/8/84/Flag_of_Latvia.svg","https://upload.wikimedia.org/wikipedia/commons/4/47/Flag_of_Liechtenstein.svg","https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Lithuania.svg","https://upload.wikimedia.org/wikipedia/commons/d/da/Flag_of_Luxembourg.svg","https://upload.wikimedia.org/wikipedia/commons/f/f8/Flag_of_Macedonia.svg","https://upload.wikimedia.org/wikipedia/commons/7/73/Flag_of_Malta.svg","https://upload.wikimedia.org/wikipedia/commons/2/27/Flag_of_Moldova.svg","https://upload.wikimedia.org/wikipedia/commons/e/ea/Flag_of_Monaco.svg","https://upload.wikimedia.org/wikipedia/commons/6/64/Flag_of_Montenegro.svg","https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg","https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg","https://upload.wikimedia.org/wikipedia/en/1/12/Flag_of_Poland.svg","https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg","https://upload.wikimedia.org/wikipedia/commons/7/73/Flag_of_Romania.svg","https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg","https://upload.wikimedia.org/wikipedia/commons/b/b1/Flag_of_San_Marino.svg","https://upload.wikimedia.org/wikipedia/commons/f/ff/Flag_of_Serbia.svg","https://upload.wikimedia.org/wikipedia/commons/e/e6/Flag_of_Slovakia.svg","https://upload.wikimedia.org/wikipedia/commons/f/f0/Flag_of_Slovenia.svg","https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg","https://upload.wikimedia.org/wikipedia/en/4/4c/Flag_of_Sweden.svg","https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg","https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg","https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg","https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg"];

console.log('size = ' + countries.length)
var db  = [];
var entry = {};

var transformToObject = function(country, capital, flag){
  for (var i = 0; i < country.length; i++){
    entry.country = country[i];
    entry.capital = capital[i];
    entry.flag = flag[i]
    db.push(entry);
    entry = {};
  };
};
transformToObject(countries, capitals, flags);

var toSend = JSON.stringify(db);
console.log(toSend);



fs.writeFile('myDb.json', toSend, 'utf8', function(err){
  if (err){
    console.log('impossible de créer le fichier')
  }
});
