(function(a,b,c,d,e,f){function k(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=j&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=j&f+1],c=c*d+h[j&(h[f]=h[g=j&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function l(a,b){var e,c=[],d=(typeof a)[0];if(b&&"o"==d)for(e in a)try{c.push(l(a[e],b-1))}catch(f){}return c.length?c:"s"==d?a:a+"\0"}function m(a,b){for(var d,c=a+"",e=0;c.length>e;)b[j&e]=j&(d^=19*b[j&e])+c.charCodeAt(e++);return o(b)}function n(c){try{return a.crypto.getRandomValues(c=new Uint8Array(d)),o(c)}catch(e){return[+new Date,a,a.navigator.plugins,a.screen,o(b)]}}function o(a){return String.fromCharCode.apply(0,a)}var g=c.pow(d,e),h=c.pow(2,f),i=2*h,j=d-1;c.seedrandom=function(a,f){var j=[],p=m(l(f?[a,o(b)]:0 in arguments?a:n(),3),j),q=new k(j);return m(o(q.S),b),c.random=function(){for(var a=q.g(e),b=g,c=0;h>a;)a=(a+c)*d,b*=d,c=q.g(1);for(;a>=i;)a/=2,b/=2,c>>>=1;return(a+c)/b},p},m(c.random(),b)})(this,[],Math,256,6,52);

function StringHash(input) {
  if(typeof input.length == "undefined") return Math.random();

  var hash = 0;
  var n = input.length;
  
  for(var i = 0; i < n; i++) {
    hash += input.charCodeAt(i) * (Math.pow(31, n - 1 - i));
    hash &= 0xffffffff;
  }
  
  return hash;
}

function Simplex() {
  // Utility functions
  function Grad(x, y, z, w) {
    if(arguments.length == 2) return {'x':x, 'y':y};
    if(arguments.length == 3) return {'x':x, 'y':y, 'z':z};
    if(arguments.length == 4) return {'x':x, 'y':y, 'z':z, 'w':w};
    
    throw "incorrect paramaters";
  }

  // Local Space variables
  var grad2 = [Grad(1,0),Grad(-1,0),Grad(0,1),Grad(0,-1)];
  var grad3 = [Grad(1,1,0),Grad(-1,1,0),Grad(1,-1,0),Grad(-1,-1,0), Grad(1,0,1),Grad(-1,0,1),Grad(1,0,-1),Grad(-1,0,-1), Grad(0,1,1),Grad(0,-1,1),Grad(0,1,-1),Grad(0,-1,-1)];
  var grad4 = [Grad(0,1,1,1),Grad(0,1,1,-1),Grad(0,1,-1,1),Grad(0,1,-1,-1), Grad(0,-1,1,1),Grad(0,-1,1,-1),Grad(0,-1,-1,1),Grad(0,-1,-1,-1), Grad(1,0,1,1),Grad(1,0,1,-1),Grad(1,0,-1,1),Grad(1,0,-1,-1), Grad(-1,0,1,1),Grad(-1,0,1,-1),Grad(-1,0,-1,1),Grad(-1,0,-1,-1), Grad(1,1,0,1),Grad(1,1,0,-1),Grad(1,-1,0,1),Grad(1,-1,0,-1), Grad(-1,1,0,1),Grad(-1,1,0,-1),Grad(-1,-1,0,1),Grad(-1,-1,0,-1), Grad(1,1,1,0),Grad(1,1,-1,0),Grad(1,-1,1,0),Grad(1,-1,-1,0), Grad(-1,1,1,0),Grad(-1,1,-1,0),Grad(-1,-1,1,0),Grad(-1,-1,-1,0)];
  
  var p = Array(256);
  
  var perm = new Array(512);
  var permMod12 = new Array(512);
  
  // Generates the permutations based on the seed
  function generatePerm(seed) {
    if(arguments.length > 0) Math.seedrandom(seed);
    
    // generate temp array
    var tmp = new Array(256);
    for(var i = 0; i < 256; i++) {
      tmp[i] = (Math.random() * 255) & 255;
    }
    
    // To remove the need for index wrapping, double the permutation table length
    for( var i =0; i < 512; i++) {
      perm[i] = tmp[i & 255];
      permMod12[i] = perm[i] % 12;
    }
  }
  
  // use the default perms
  if(arguments.length > 0) {
    generatePerm(arguments[0]);
  } else {
    generatePerm();
  }
  
  // Skewing and unskewing factors for 2, 3, and 4 dimensions
  var F2 = 0.5*(Math.sqrt(3.0)-1.0);
  var G2 = (3.0-Math.sqrt(3.0))/6.0;
  var F3 = 1.0/3.0;
  var G3 = 1.0/6.0;
  var F4 = (Math.sqrt(5.0)-1.0)/4.0;
  var G4 = (5.0-Math.sqrt(5.0))/20.0;
  
  // Dot product function
  function dot(g, x, y, z, w) {
    if(arguments.length == 3) return (g.x*x) + (g.y*y);
    if(arguments.length == 4) return (g.x*x) + (g.y*y) + (g.z*z);
    if(arguments.length == 5) return (g.x*x) + (g.y*y) + (g.z*z) + (g.w*w);
    
    throw "wrong number of paramaters";
  }
  
  function noise1d(xin) {
    var i0 = Math.floor(xin);
    var i1 = i0+1;
    
    var x0 = x0 - i0;
    var x1 = x0 - 1.0;
    
    var n0, n1;
    
    var t0 = 1.0-(x0*x0);
    
    t0 *= t0;
    //n1 = t1 * t1 * 
  }
  
  function noise2d(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin)*F2; // Hairy factor for 2D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var t = (i+j)*G2;
    var X0 = i-t; // Unskew the cell origin back to (x,y) space
    var Y0 = j-t;
    var x0 = xin-X0; // The x,y distances from the cell origin
    var y0 = yin-Y0;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1.0 + 2.0 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    var ii = i & 255;
    var jj = j & 255;
    var gi0 = permMod12[ii+perm[jj]];
    var gi1 = permMod12[ii+i1+perm[jj+j1]];
    var gi2 = permMod12[ii+1+perm[jj+1]];
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0*x0-y0*y0;
    if(t0<0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * dot(grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1*x1-y1*y1;
    if(t1<0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * dot(grad3[gi1], x1, y1);
    }
    var t2 = 0.5 - x2*x2-y2*y2;
    if(t2<0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * dot(grad3[gi2], x2, y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
  }
  
  function noise3d(xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin+yin+zin)*F3; // Very nice and simple skew factor for 3D
    var i = Math.floor(xin+s);
    var j = Math.floor(yin+s);
    var k = Math.floor(zin+s);
    var t = (i+j+k)*G3;
    var X0 = i-t; // Unskew the cell origin back to (x,y,z) space
    var Y0 = j-t;
    var Z0 = k-t;
    var x0 = xin-X0; // The x,y,z distances from the cell origin
    var y0 = yin-Y0;
    var z0 = zin-Z0;
    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if(x0>=y0) {
      if(y0>=z0)
        { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order
        else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order
        else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; } // Z X Y order
      }
    else { // x0<y0
      if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order
      else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
    var x2 = x0 - i2 + 2.0*G3; // Offsets for third corner in (x,y,z) coords
    var y2 = y0 - j2 + 2.0*G3;
    var z2 = z0 - k2 + 2.0*G3;
    var x3 = x0 - 1.0 + 3.0*G3; // Offsets for last corner in (x,y,z) coords
    var y3 = y0 - 1.0 + 3.0*G3;
    var z3 = z0 - 1.0 + 3.0*G3;
    // Work out the hashed gradient indices of the four simplex corners
    var ii = i & 255;
    var jj = j & 255;
    var kk = k & 255;
    var gi0 = permMod12[ii+perm[jj+perm[kk]]];
    var gi1 = permMod12[ii+i1+perm[jj+j1+perm[kk+k1]]];
    var gi2 = permMod12[ii+i2+perm[jj+j2+perm[kk+k2]]];
    var gi3 = permMod12[ii+1+perm[jj+1+perm[kk+1]]];
    // Calculate the contribution from the four corners
    var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if(t0<0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * dot(grad3[gi0], x0, y0, z0);
    }
    var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if(t1<0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * dot(grad3[gi1], x1, y1, z1);
    }
    var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if(t2<0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * dot(grad3[gi2], x2, y2, z2);
    }
    var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if(t3<0) n3 = 0.0;
    else {
      t3 *= t3;
      n3 = t3 * t3 * dot(grad3[gi3], x3, y3, z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to stay just inside [-1,1]
    return 32.0*(n0 + n1 + n2 + n3);
  }
  
  function noise4d(xin, yin, zin, win) {
  }
  
  // Make the noise function public
  return {
    noise2d: noise2d,
    noise3d: noise3d,
    setSeed: generatePerm
  }
}

function SimplexLayer() {
  var cntOctives = 1;
  var simplexOctives = [];
  var layerSeed = (Math.random() * 18446744073709551615) -9223372036854775808;
  var seedSeperator = "_";
  var zoomLevel = 1;
  var layerFrequency = 1;
  var layerAmplitude = 1;
  var layerScale = 1;
  
  function Gen2d(x, y) {
    var val = 0;
    var detail = zoomLevel * layerScale;
    var pow = amplitudeLevel;
    
    for(var j = 0; j < cntOctives; j++) {
      val += gen.noise2d(x/detail, y/detail) * pow;
      detail /= layerFrequency;
      pow *= amplitudeLevel;
    }
    
    return val;
  }
  
  function funScale(val){
    if(arguments.length && parseFloat(val)) {
      val = parseFloat(val);
      if(val < 0) throw "Frequency out or range";
      
      layerScale = val;
    }
    
    return layerScale;
  }
  
  function funFrequency(val){
    if(arguments.length && parseFloat(val)) {
      val = parseFloat(val);
      if(val < 0) throw "Frequency out or range";
      
      layerFrequency = val;
    }
    
    return layerFrequency;
  }
  
  function funAmplitude(val){
    if(arguments.length && parseFloat(val)) {
      val = parseFloat(val);
      if(val < 0) throw "Amplitude out or range";
      
      layerAmplitude = val;
    }
    
    return layerAmplitude;
  }
  
  function funZoom(val){
    if(arguments.length && parseFloat(val)) {
      val = parseFloat(val);
      if(val < 0) throw "Zoom out or range";
      
      zoomLevel = val;
    }
    
    return zoomLevel;
  }
  
  function funSeed(val) {
    if(arguments.length) {
      val = val.toString();
      if(!val.length) val = ((Math.random() * 18446744073709551615) -9223372036854775808).toString();
      
      // Store the seed
      layerSeed = val;
      
      // Reseed the layers
      for(var i = 0; i < cntOctives; i++) {
        simplexOctives[i].setSeed(layerSeed + seedSeperator + i);
      }      
    }
    
    return layerSeed;
  }
  
  function SeedSeperator(sep) {
    if(arguments.length) {
      sep = sep.toString();
      if(!sep.length) sep = "_";
      
      seedSeperator = sep;
    }
    
    return seedSeperator;
  }
  
  function Octives(num) {
    if(arguments.length) {
      if(!parseInt(num)) throw "Octive count must be a positive intiger";
      if(num > 12) throw "Octive out of bounds";
      cntOctives = parseInt(num);
      
      // Generate the initial octives
      for(var i = simplexOctives.length; i < cntOctives; i++) {
        simplexOctives[i] = new Simplex(layerSeed + seedSeperator + i);
      }
    }
    
    return cntOctives;
  }

  return {
    amplitude: funAmplitude,
    frequency: funFrequency,
    generate2d: Gen2d,
    octives: Octives,
    scale: funScale,
    seed: funSeed,
    seedSeperator: SeedSeperator,
    zoom: funZoom
  };
}

var gen = new Simplex();

function World() {
  // Local space private variables
  var seed;
  
  function setSeed(input) {
    if(parseInt(input)) {
      seed = parseInt(input);
    } else if(typeof arguments[0].length != "undefined" && arguments[0].length > 0) {
      seed = stringHash();
    } else {
      seed = (Math.random() * 18446744073709551615) -9223372036854775808;
    }
  }
  
  function getSeed() {
    return seed;
  }
  
  // Return the object
  return {
    getSeed: getSeed,
    setSeed: setSeed
  }
}
