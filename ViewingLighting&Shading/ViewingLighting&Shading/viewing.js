

var canvas;
var gl;

var numTimesToSubdivide = 3;
 
var index = 0;

var pointsArray = [];
var normalsArray = [];
var shaderType = 0;

var near = 0.3;
var far = 11;

var  fovy = 45.0;
var  aspect = 1.0;

var r=0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 0.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var normalmatrix, normalMatrixLoc;

var eyeX = 0;
var eyeY = 0;
var eyeZ = 5;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var program;
    
function triangle(a, b, c) {     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);
    
     // normals are vectors     
     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);

     index += 3;     
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-gouraud", "fragment-gouraud" );
    gl.useProgram( program );
    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

      
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);    

    
        
    document.getElementById("IncreaseSUB").onclick = function(){
        numTimesToSubdivide++; 
        index = 0;
        pointsArray = [];
        normalsArray = []; 
        init();
    };
    document.getElementById("DecreaseSUB").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = []; 
        normalsArray = [];
        init();
    };
    document.getElementById("FOVY").oninput = function() {
        fovy = event.srcElement.value;
        console.log(fovy);
    };
    document.getElementById("MaterialDiffuseColorR:").oninput = function (event) {
        materialDiffuse[0] = event.srcElement.value;
        uniform();
        console.log(materialDiffuse);
    };
    document.getElementById("MaterialDiffuseColorG:").oninput = function (event) {
        materialDiffuse[1] = event.srcElement.value;
        uniform();
        console.log(materialDiffuse);
    };
    document.getElementById("MaterialDiffuseColorB:").oninput = function (event) {
        materialDiffuse[2] = event.srcElement.value;
        uniform();
        console.log(materialDiffuse);
    };
    document.getElementById("beta").oninput = function(){
      materialShininess  = event.srcElement.value;    
      uniform();     
    };
    document.getElementById("camerapositionX").oninput = function(){
        eyeX = event.srcElement.value;
            
    };
    document.getElementById("camerapositionY").oninput = function(){
        eyeY = event.srcElement.value;
    };
    document.getElementById("camerapositionZ").oninput = function(){
       eyeZ = event.srcElement.value;
    };
    document.getElementById("lightpositionX").oninput = function(event) {
        lightPosition[0] = event.srcElement.value;
		init();
    };
	document.getElementById("lightpositionY").oninput = function(event) {
        lightPosition[1] = event.srcElement.value;
        init();
    };
	document.getElementById("lightpositionZ").oninput = function(event) {
        lightPosition[2] = event.srcElement.value;
        init();
    };
    
    document.getElementById("shadingMenu").onchange = function(event) {
        shaderType = event.target.value;
        if(shaderType == 0){
        program = initShaders( gl, "vertex-gouraud", "fragment-gouraud" );
        console.log(shaderType);
        }
        else if(shaderType == 1){
        program = initShaders( gl, "vertex-phong", "fragment-phong" );
        console.log(shaderType);
        }
        gl.useProgram( program );
        uniform();
       
     };

     uniform();
     
    render();
}
function uniform(){
     modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
     projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
     normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
     
     ambientProduct = mult(lightAmbient, materialAmbient);
     diffuseProduct = mult(lightDiffuse, materialDiffuse);
     specularProduct = mult(lightSpecular, materialSpecular);
 
     gl.uniform4fv( gl.getUniformLocation(program,"ambientProduct"),flatten(ambientProduct) );
     gl.uniform4fv( gl.getUniformLocation(program,"diffuseProduct"),flatten(diffuseProduct) );
     gl.uniform4fv( gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct) );	
     gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(lightPosition) );
     gl.uniform1f( gl.getUniformLocation(program,"shininess"),materialShininess );
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(eyeX,eyeY,eyeZ);

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
	normalmatrix = normalMatrix(modelViewMatrix, true);
            
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalmatrix) );
    
    if(shaderType == 2){
        gl.drawArrays( gl.LINE_LOOP, 0, pointsArray.length );
    }
	else{
        gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );
    }
    window.requestAnimFrame(render);
}
