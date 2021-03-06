exports.action = function(data, callback, config, SARAH){
// CONFIG
 name= data.name;
 var answers = config.answers;  
  configM = config.modules.spotifyonsqueez; 
  if (!configM.ip){ 
    console.log("Missing squeezebox config");
    callback({'tts' : 'Il manque la configuration de l i p'});
    return;    
  }     
  if (!configM.portSpotify){ 
    console.log("Missing squeezebox config");
    callback({'tts' : 'Il manque la configuration du port'});
    return;  
  }
 
  if ( data.action == 'playlist') { 
  		launchPlaylsit( name, callback, configM, answers);    
  }
  else if ( data.action == 'update') {
      update(callback, configM);    
  }
  else {
   		callback({'tts' : "Je ne sais pas faire"});
  	}      
}

exports.cron = function(callback, config, task){
   console.log("Update des playlists");
   update(callback, config.modules.spotifyonsqueez);
  
  callback({'tts': ""});
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
	 var url = 'http://'+config.ip+':'+config.portSqueezeServer+'/status.xml?player='+config.squeezeboxPricipale+'&p0=playlist&p1=play&p2='+uri;
	 sendURL(url, callback, function(){}); 
  	var answers = config.answers.split('|');
    var answer = answers[ Math.floor(Math.random() * answers.length)];
  console.log(answer);
    callback({'tts': answer}) 
}

 // ------------------------------------------
  //  UPDATING XML
  // ------------------------------------------

var update = function(callback, config){
  
  var fs   = require('fs');
  var file = 'plugins/spotifyonsqueez/spotifyonsqueez.xml';
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
    console.log('maj ok'); 
    var regexp = new RegExp('§[^§]+§','gm');
    xml= xml.replace(regexp,replace);
    fs.writeFileSync(file, xml, 'utf8');
    		 })

  callback({'tts' : "Voilà j'ai mis les playlist à jour"});
  
} 

 