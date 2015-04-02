/*!
 * Comparator.js v0.1
 *
 * Copyright (c) 2015, Ejvind Hansen
 * http://ejvindh.net/
 *
 * Distributed under the GPL v3.0 license. See LICENSE file for details.
 *
 * All rights reserved.
 *
 * Date: Sat Mar 27 09:00:00 2015
 *
 ***/

var canvas, numberOfVites, animationSpeed;
var vites  = new Array();
var comparisons = new Array();
var currentComparisons = new Array();
var radiusNodeCircleW, radiusNodeCircleH, connectorButtonRadius;
var centerIndex, centerViewX, centerViewY, radiusViewW, radiusViewH;
var clickSizeX, clickSizeY;
var txtProperties, bodyProperties;

function init() {
  canvas = document.getElementById("myCanvas");
  setSizes();
  initializeVites();
  initializeComparisons();
  centerIndex = -1;
  initializeTextContainer();
  draw();
  animate();
  txtProperties = document.querySelector(".textContainer");
  txtProperties.style.fontFamily = layout.comparisonTextFont;
//  txtProperties.style.fontSize = layout.comparisonTextSize;
  bodyProperties = document.querySelector("body");
  bodyProperties.style.fontSize = layout.comparisonTextSize;

  var onresize = function(e) {
    setSizes();
  }
  window.addEventListener("resize", onresize);
  
  canvas.addEventListener('click', function(event) {
      //Determine what has been clicked -- nodes or connector-selector
      var mousePos = getMousePos(canvas, event);
      var nodeHit = findClickedNodes(mousePos);
      var connectorHit = findClickedConnectors(mousePos);
      if (nodeHit >=0) {
        if (centerIndex == nodeHit) {
          centerIndex = -1;
        } else {
          centerIndex = nodeHit;
        }
        calculateNewXY();
        extractComparisons(nodeHit);
        initializeTextContainer();
      }
      if (connectorHit >=0) {
        showComparisons(connectorHit);
      }
  }, false);
}

function getMousePos(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function findClickedNodes(mousePos) {
  // Did the mouse click a node?
  var resizeRatioX = clickSizeX / (centerViewX * 2);
  var resizeRatioY = clickSizeY / (centerViewY * 2);
  var clickedNode = -1;
  var i = 0;
  while (clickedNode==-1 && i < numberOfVites) {
    var xMin = (vites[i].curX - radiusNodeCircleW) * resizeRatioX;
    var xMax = (vites[i].curX + radiusNodeCircleW) * resizeRatioX;
    var yMin = (vites[i].curY - radiusNodeCircleH) * resizeRatioY;
    var yMax = (vites[i].curY + radiusNodeCircleH) * resizeRatioY;
    if (mousePos.x > xMin && mousePos.x < xMax &&
        mousePos.y > yMin && mousePos.y < yMax) {
      clickedNode = i;
    }
    i++;
  }
  return clickedNode;
}

function findClickedConnectors(mousePos) {
  // Did the mouse click a connectorbutton?
  var resizeRatioX = clickSizeX / (centerViewX * 2);
  var resizeRatioY = clickSizeY / (centerViewY * 2);
  var clickedConnector = -1;
  var i = 0;
  while (clickedConnector==-1 && i < numberOfVites) {
    if (i != centerIndex) {
      var xMin = (vites[i].connectorMiddleX - connectorButtonRadius) * resizeRatioX;
      var xMax = (vites[i].connectorMiddleX + connectorButtonRadius) * resizeRatioX;
      var yMin = (vites[i].connectorMiddleY - connectorButtonRadius) * resizeRatioY;
      var yMax = (vites[i].connectorMiddleY + connectorButtonRadius) * resizeRatioY;
      if (mousePos.x > xMin && mousePos.x < xMax &&
          mousePos.y > yMin && mousePos.y < yMax &&
          vites[i].comparison > 0) {
        clickedConnector = i;
      }
    }
    i++;
  }
  return clickedConnector;
}

function initializeTextContainer() {
  // Reset content of the textcontainer (upon firstRun and when clicking af new node into the center)
  var currentVite = "";
  if (centerIndex != -1) {
    currentVite = vites[centerIndex].name + " <small>" + messages.clickConnector + "</small>";
  } else {
    currentVite = "<small>" + messages.clickNode + "</small>";
  }
  document.getElementById("vitesContainer").innerHTML = currentVite;
  document.getElementById("linksContainer").innerHTML = "<h1>" + messages.links + "</h1>";
  document.getElementById("diffContainer").innerHTML = "<h1>" + messages.differences + "</h1>";
  document.getElementById("similaContainer").innerHTML = "<h1>" + messages.similarities + "</h1>";
  document.getElementById("commentContainer").innerHTML = "<h1>" + messages.comments + "</h1>";
}

function showComparisons(connectorHit) {
  // ConnectorButton has been clicked -- fill content into the textcontainer
  var vitesText = vites[centerIndex].name + " " + messages.versus + " " + vites[connectorHit].name;
  var linksText = "<h1>" + messages.links + "</h1>";
  var diffText = "<h1>" + messages.differences + "</h1>";
  var simText = "<h1>" + messages.similarities + "</h1>";
  var commentText = "<h1>" + messages.comments + "</h1>";
  var connectorHitId = vites[connectorHit].id;
  for (var i=0; i<currentComparisons.length; i++) {
    if ((currentComparisons[i].ids.indexOf(connectorHitId) > -1)) {
      diffText = diffText + currentComparisons[i].differences;
      simText = simText + currentComparisons[i].similarities;
      commentText = commentText + currentComparisons[i].comments;
    }
  }
  document.getElementById("vitesContainer").innerHTML = vitesText;
  document.getElementById("linksContainer").innerHTML = linksText;
  document.getElementById("diffContainer").innerHTML = diffText;
  document.getElementById("similaContainer").innerHTML = simText;
  document.getElementById("commentContainer").innerHTML = commentText;
}

function calculateNewXY() {
  // When new motion has been activated, calculate where the nodes should end
  var offset = 0;
  var numberOfNodes, x, y;
  if (centerIndex == -1) {
    numberOfNodes = numberOfVites;
  } else {
    numberOfNodes = numberOfVites - 1;
  }
  for (var i = 0; i < numberOfVites; i++) {
    if (i == centerIndex) {
      offset = 1;
      x = centerViewX;
      y = centerViewY;
    } else {
      x = Math.round(centerViewX + radiusViewW * Math.cos(2*Math.PI * (i-offset)/numberOfNodes));
      y = Math.round(centerViewY + radiusViewH * Math.sin(2*Math.PI * (i-offset)/numberOfNodes));
    }
    vites[i].rightX = x;
    vites[i].rightY = y;
  }
}

function animate() {
  // Upon each screenframe: Are any animations called for? If yes, go to draw()
  reqAnimFrame = window.mozRequestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame     ||
        window.oRequestAnimationFrame;
  reqAnimFrame(animate);
  var changeOffset = false;
  for (var i = 0; i < numberOfVites; i++) {
    var trivialityLimit = 5; // stop animation if nodes are "close enough" to their "right" x,y
    if (Math.abs(vites[i].curX - vites[i].rightX) > trivialityLimit || Math.abs(vites[i].curY - vites[i].rightY) > trivialityLimit) {
      changeOffset = true;
      //Calculate new positions for nodes
      vites[i].curX = vites[i].curX + ((vites[i].rightX - vites[i].curX)/animationSpeed);
      vites[i].curY = vites[i].curY + ((vites[i].rightY - vites[i].curY)/animationSpeed);
      vites[i].connectorMiddleX = vites[i].curX + ((centerViewX - vites[i].curX) / 2);
      vites[i].connectorMiddleY = vites[i].curY + ((centerViewY - vites[i].curY) / 2);
    }
  }
  if (changeOffset) {draw()};
}

function draw() {
  // Clear canvas and do a new drawing
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < numberOfVites; i++) {
    connector(context, vites[i].curX, vites[i].curY, vites[i].connectorMiddleX, vites[i].connectorMiddleY, vites[i].comparison);
  }
  for (var i = 0; i < numberOfVites; i++) {
    oval(context,vites[i].curX,vites[i].curY,radiusNodeCircleW,radiusNodeCircleH,vites[i].name);
  }
}

function oval(con, centerX, centerY, width, height, nodeName) {
  //Draw the ovals
  con.beginPath();
  con.moveTo(centerX, centerY - height);
  
  con.bezierCurveTo(
    centerX + width*1.3, centerY - height,
    centerX + width*1.3, centerY + height,
    centerX, centerY + height
  );
  con.bezierCurveTo(
    centerX - width*1.3, centerY + height,
    centerX - width*1.3, centerY - height,
    centerX, centerY - height
  );
  con.fillStyle = layout.nodeColor;
  con.fill();
  con.font = layout.nodeTextSize + " " + layout.nodeTextFont;
  con.fillStyle = layout.nodeTextColor;
  con.textAlign = "center";
  con.textBaseline = 'middle';
  con.fillText(nodeName, centerX, centerY,(radiusNodeCircleW*2)-20);
  con.closePath();
}

function connector(con, centerX, centerY, conMidX, conMidY, compFlag) {
  //Draw connectors and connector buttons
  con.beginPath();
  con.lineWidth=parseInt(layout.connectorWidth);
  con.moveTo(centerViewX, centerViewY);
  con.lineTo(centerX, centerY);
  if (compFlag > 0) {
    con.moveTo(conMidX, conMidY);
    con.arc(conMidX, conMidY, connectorButtonRadius, 0, 2 * Math.PI, false);
  }
  con.fillStyle= layout.comparisonButtonColor;
  con.strokeStyle = layout.connectorColor;
  con.stroke();
  con.fill();
  con.closePath();
}

function initializeVites() {
  //Get content of nodes.xml into the vites[] array
  centerIndex = -1;
  xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET","nodes.xml",false);
  xmlhttp.send();
  xmlDoc=xmlhttp.responseXML;
  var x=xmlDoc.getElementsByTagName("POSITION");
  numberOfVites = x.length;
  for (i=0;i<numberOfVites;i++) { 
    var posId = x[i].getElementsByTagName("ID")[0].childNodes[0].nodeValue;
    var posName = x[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue;
    var posX = centerViewX + (radiusViewW * Math.cos(2*Math.PI * i/numberOfVites));
    var posY = centerViewY + (radiusViewH * Math.sin(2*Math.PI * i/numberOfVites));
    var connectorMiddleX = posX + ((centerViewX - posX) / 2);
    var connectorMiddleY = posY + ((centerViewY - posY) / 2);
        vites[i] = {	
          id:posId, 
          name:posName, 
          curX:posX, 
          curY:posY,
          connectorMiddleX: connectorMiddleX, 
          connectorMiddleY: connectorMiddleY, 
          rightX:posX, 
          rightY:posY, 
          comparison:0
      };
  }
}

function initializeComparisons() {
  //Get content of nodes.xml into the comparisons[] array
  xmlhttp.open("GET","relations.xml",false);
  xmlhttp.send();
  xmlDoc=xmlhttp.responseXML;
  var x=xmlDoc.getElementsByTagName("COMPARISON");
  for (i=0;i<x.length;i++) { 
    var ids = "";
    var similarities = "";
    var differences = "";
    var comments = "";
    for (var j=0; j<x[i].getElementsByTagName("ID").length;j++) {
      ids = ids + "<p>" + x[i].getElementsByTagName("ID")[j].childNodes[0].nodeValue + "</p>";
    }
    for (var j=0; j<x[i].getElementsByTagName("SIMILARITY").length;j++) {
      similarities = similarities + "<p>" + x[i].getElementsByTagName("SIMILARITY")[j].childNodes[0].nodeValue + "</p>";
    }
    for (var j=0; j<x[i].getElementsByTagName("DIFFERENCE").length;j++) {
      differences = differences + "<p>" + x[i].getElementsByTagName("DIFFERENCE")[j].childNodes[0].nodeValue + "</p>";
    }
    for (var j=0; j<x[i].getElementsByTagName("COMMENT").length;j++) {
      comments = comments + "<p>" + x[i].getElementsByTagName("COMMENT")[j].childNodes[0].nodeValue + "</p>";
    }
    comparisons[i] = {ids:ids, similarities:similarities, differences:differences, comments:comments};
  }
}

function extractComparisons(nodeHit) {
  // New node has been clicked to the center, move the potential comparisons in to currentComparisons[] array
  currentComparisons.length = 0;
  if (centerIndex == -1) {
    for (i=0;i<numberOfVites;i++) { 
      vites[i].comparison = 0;
    }
  } else {
    var found = 0;
    for (i=0;i<numberOfVites;i++) { 
      vites[i].comparison = 0;
    }
    for (var i=0; i< comparisons.length; i++) {
      if (comparisons[i].ids.indexOf(vites[nodeHit].id) > -1) {
        for (var j=0; j<numberOfVites; j++) {
          if (comparisons[i].ids.indexOf(vites[j].id) > -1) {
            vites[j].comparison++;
          }
        }
        currentComparisons[found] = comparisons[i];
        found++;
      }
    }
  }
}

function setSizes() {
  //Set and Calculate sizes of nodes and circles
  radiusNodeCircleW = parseInt(layout.nodeSizeW);
  radiusNodeCircleH = parseInt(layout.nodeSizeH);
  connectorButtonRadius = parseInt(layout.comparisonButtonSize);
  centerViewX = Math.round(canvas.width / 2);
  centerViewY = Math.round(canvas.height / 2);
  radiusViewW = Math.round(canvas.width / 2) - radiusNodeCircleW;
  radiusViewH = Math.round(canvas.height / 2) - radiusNodeCircleH;
  clickSizeX = canvas.scrollWidth;
  clickSizeY = canvas.scrollHeight;
  animationSpeed = parseInt(layout.animationSpeed); //small numbers == faster
}
