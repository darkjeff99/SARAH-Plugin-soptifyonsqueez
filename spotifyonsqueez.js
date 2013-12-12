exports.action = function(data, callback, config, SARAH){
// CONFIG
 name= data.name;
 var answers = config.answers;  
  config = config.modules.spotifyonsqueez; 
  if (!config.ip){ 
    console.log("Missing squeezebox config");
    callback({'tts' : 'Il manque la configuration de l i p'});
    return;    
  }     
  if (!config.portSpotify){ 
    console.log("Missing squeezebox config");
    callback({'tts' : 'Il manque la configuration du port'});
    return;  
  }
 
  if ( data.action == 'playlist') { 
  		launchPlaylsit( name, callback, config, answers);    
  }
  else if ( data.action == 'update') { 
      
      update( data.directory, callback, config);    
  }
  else {
   		callback({'tts' : "Je ne sais pas faire"});
  	}      
}   
      
var sendURL = function(url, callback, cb){ 
 	var request = require('request'); 
  	request({ 'uri' : url}, function (err, response, body ) { 
 
  		if (err || response.statusCode != 200){
  			callback({'tts' : "La connexion à la squizebox"});
  			return;
  		}   
  		cb(body);  
  }); 
}  
 
var launchPlaylsit = function(name, callback, config, answers){ 
		var name = name.toLowerCase();     
		var trouve = false;  
		console.log('Lancement de la playsliste spotify :'+name);
		sendURL('http://'+config.ip+':'+config.portSpotify+'/playlists.json?user='+config.utilisateur, callback, function(body){
      
			 	var json = JSON.parse(body);
			 	for (var i=0 ; i < json.playlists.length ; i++)	
						{ 
							var listName = json.playlists[i].name.toLowerCase();
						    if ( listName == name) { 
						        trouve = true;
						        playUri(json.playlists[i].uri, callback,config, answers);
						       
						     }  
						} 
				if (trouve == false){
					callback({'tts' : "Je ne trouve pas la playlist"});
				}    
		 	    return; 
 	 	}) ;  
 	
}

var playUri = function (uri, callback, config){
	 var url = 'http://'+config.ip+':'+config.portSqueezeServer+'/status.xml?player=00:04:20:1e:6d:b2&p0=playlist&p1=play&p2='+uri;
	 sendURL(url, callback, function(){}); 
  	var answers = config.answers.split('|');
    var answer = answers[ Math.floor(Math.random() * answers.length)];
  console.log(answer);
    callback({'tts': answer}) 
}

 // ------------------------------------------
  //  UPDATING XML
  // ------------------------------------------

var update = function(directory, callback, config){
  if (!directory){ return; }
  
    console.log('maj ok'); 
  var fs   = require('fs');
  var file = directory + '/../plugins/spotifyonsqueez/spotifyonsqueez.xml';
  var xml  = fs.readFileSync(file,'utf8');
  sendURL('http://'+config.ip+':'+config.portSpotify+'/playlists.json?user='+config.utilisateur, callback, function(body){ 
    var replace  = '§ -->\n';
        replace += '<rule id="rulePlaylistName">\n';
        replace += '  <one-of>\n';
    var json;
    json = JSON.parse(body);
    for (var i=0 ; i < json.playlists.length ; i++) {							
                   replace += '     <item>'+json.playlists[i].name.toLowerCase()+'<tag>out.action="playlist";out.name="'+json.playlists[i].name.toLowerCase()+'";</tag></item>\n';
                 }
    replace += '  </one-of>\n';
    replace += '</rule>\n';  
    replace += '<!-- §';
    var regexp = new RegExp('§[^§]+§','gm');
    xml= xml.replace(regexp,replace);
    fs.writeFileSync(file, xml, 'utf8');
    console.log(replace);
    		 })

  callback({'tts' : "Voilà j'ai mis les playlist à jour"});
  
} 

 