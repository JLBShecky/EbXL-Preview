$().ready(function (){
  var dragging = false;
  var moved = false;
  var genTimer = null;
  
  $('#saveImg').click(function(){
    if($('#preview')[0].toDataURL)
      $('#saveImg')[0].src = $('#preview')[0].toDataURL();
  });
  
  $('#txt_SettingsSeed').bind('change keydown', function(e){
    if(e.type == "keydown" && e.keyCode != 13) return true;
    
    gen.setSeed($('#txt_SettingsSeed').val());
    BuildURL();
        
    generateMap();
  });
  
  $('.settingsChangeEvent').change(function(){
    clearTimeout(genTimer);
    
    $('#txt_SettingsSeed')[0].title = this.value;
    BuildURL();
    
    //this.title=this.value;
  
    genTimer = setTimeout(function(){
      generateMap();
      genTimer = null;  
    }, 333);
    
  });
  
  $('#preview').mousedown(function(e){
    dragging = e;
    dragging.oldX = offsetX;
    dragging.oldY = offsetY;
    
    return false;
  });
  
  $('#preview').mousemove(function(e){
    $('#preview')[0].title = "x: " + (e.offsetX + offsetX) + "\n" +
                             "y: " + (e.offsetY + offsetY);
                             
    
  });
  
  $(window).mouseup(function(e){
    if(!dragging) return;
    
    offsetX = dragging.oldX + (dragging.offsetX - e.offsetX);
    offsetY = dragging.oldY + (dragging.offsetY - e.offsetY);
    
    generateMap();
    
    dragging = false;
  });
  
  $('#txt_SettingsSeed').val("bob's your uncle");
  gen.setSeed("bob's your uncle");
  
  LoadURL();
  
  generateMap();
  
});

var lastEvt;

var offsetX = -720;
var offsetY = -360;

var biomes = Math.floor(Math.random() * 128);
var biome;
var colors = Array(biomes);

for(var i = 0; i < biomes; i++) {
  colors[i] = [(Math.random() * 255) & 255, (Math.random() * 255) & 255, (Math.random() * 255) & 255];
}

function generateMap()  {
  var c = $('#preview')[0];
  var ctx = c.getContext('2d');
  var width = c.width;
  var height = c.height;
  var val = 0;
  var x,y;
  var scale = ($('#txt_SettingsLandScale').val() * 64) + parseInt($('#txt_SettingsLandScaleGrain').val());
  var detail = scale;
  var fraction = $('#txt_SettingsDetailRatio').val();
  var rate = $('#txt_SettingsDetailFactor').val();
  var levels = $('#txt_SettingsDetailLevel').val();
  var pow = 1;
  var waterLevel = $('#txt_SettingsLandRatio').val();
  
  // get the image data
  var imgData=ctx.getImageData(0,0,c.width,c.height);
  
  for(var i=0, pos=0; i<imgData.data.length; i+=4, pos++){
    x = pos % width;
    y = Math.floor(pos / width);
    
    detail = scale;
    pow = 1;
    val = 0;
    
    
    
    for(var j = 1; j < levels; j++) {
      val += gen.noise2d((x + offsetX) / detail, (y + offsetY) / detail) * pow;
      detail /= rate;
      pow *= fraction;
    }
    
    val += gen.noise2d((x + offsetX) / detail, (y + offsetY) / detail) * pow;
    biome = Math.max(Math.min(Math.floor((biomes/2) * val), biomes -1), 0);
    
    if(val > waterLevel) {
      imgData.data[i+1]=255 - ((val - waterLevel) * 64);
      imgData.data[i+2]=0;
    } else {
      imgData.data[i+1]=0;
      imgData.data[i+2]=255 - ((waterLevel - val) * 64);
    }
    
    //imgData.data[i] = colors[biome][0];
    //imgData.data[i+1] = colors[biome][1];
    //imgData.data[i+2] = colors[biome][2];
    
    
    imgData.data[i+3]=255;
  }
  
  
  // put the map back to the canvas
  ctx.putImageData(imgData,0,0);
  
  // Copy to the mini image
  $('#saveImg')[0].src = $('#preview')[0].toDataURL();
}

function LoadURL(){
  var hash = document.location.hash.substr(1);
  var settings = hash.split("&");
  
  // 
  for(var i = 0; i < settings.length; i++){
    var cmd = settings[i].split("=");
    
    // Skip ahead if we don't have a value
    if(typeof cmd[1] == "undefined") continue;
            
    switch(cmd[0]){
      case "lScaleL":
        $('#txt_SettingsLandScale').val(parseInt(cmd[1]));
        break;
      case "lScaleS":
        $('#txt_SettingsLandScaleGrain').val(parseInt(cmd[1]));
        break;
      case "lRatio":
        $('#txt_SettingsLandRatio').val(parseFloat(cmd[1]));
        break;
      case "lDetLVL":
        $('#txt_SettingsDetailLevel').val(parseInt(cmd[1]));
        break;
      case "lDetRatio":
        $('#txt_SettingsDetailRatio').val(parseFloat(cmd[1]));
        break;
      case "lDetFact":
        $('#txt_SettingsDetailFactor').val(parseFloat(cmd[1]));
        break;
      case "seed":
        $('#txt_SettingsSeed').val(decodeURIComponent(cmd[1]));
        gen.setSeed($('#txt_SettingsSeed').val());
        break;
      case "x":
        offsetX = parseInt(cmd[1]);
        break;
      case "y":
        offsetY = parseInt(cmd[1]);
        break;        
      default:
        break;
    }
  }
}

function BuildURL(){
  var hash = "#";
  
  // Record the seed
  hash += "seed=" + encodeURIComponent($('#txt_SettingsSeed').val());
  
  // Store the x and y offset
  hash += "&x=" + offsetX;
  hash += "&y=" + offsetY;
  
  // Store the scale
  hash += "&lScaleL=" + $('#txt_SettingsLandScale').val();
  hash += "&lScaleS=" + $('#txt_SettingsLandScaleGrain').val();
  
  // Land ratio
  hash += "&lRatio=" + $('#txt_SettingsLandRatio').val();
  
  // Land detail levels
  hash += "&lDetLVL=" + $('#txt_SettingsDetailLevel').val();
  
  // Frequancy and amplitude
  hash += "&lDetRatio=" + $('#txt_SettingsDetailRatio').val();
  hash += "&lDetFact=" + $('#txt_SettingsDetailFactor').val();
  
  // Store the hash  
  document.location.hash = hash;
}