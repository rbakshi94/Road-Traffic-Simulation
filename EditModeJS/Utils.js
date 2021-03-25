
function getLinesIntersectionPt(line1,line2,mode){//Util
    let l1x1=line1.startX,l1y1=line1.startY,l1x2=line1.endX,l1y2=line1.endY;
    let l2x1=line2.startX,l2y1=line2.startY,l2x2=line2.endX,l2y2=line2.endY;

        let lineIntersectionInfo={theyIntersect:false, lambda:0};
        var det, gamma, lambda;
        det = (l1x2 - l1x1) * (l2y2 - l2y1) - (l2x2 - l2x1) * (l1y2 - l1y1);
        if (det === 0) {
          return false;
        } else {
          lambda = ((l2y2 - l2y1) * (l2x2 - l1x1) + (l2x1 - l2x2) * (l2y2 - l1y1)) / det;
          gamma = ((l1y1 - l1y2) * (l2x2 - l1x1) + (l1x2 - l1x1) * (l2y2 - l1y1)) / det;
          
          if(mode!="extrapolation"){
            if ((0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)){
                lineIntersectionInfo.theyIntersect=true;
                lineIntersectionInfo.lambda=lambda;
            }
            else{
              lineIntersectionInfo.theyIntersect=false;
              lineIntersectionInfo.lambda=0; 
            }
          }
          
          else{
            lineIntersectionInfo.theyIntersect=true;
            lineIntersectionInfo.lambda=lambda;
          }

          return lineIntersectionInfo;
        }
      
}


function clearCanvas(context=ctx){//Util
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawLine(vertex1X,vertex1Y,vertex2X,vertex2Y,width=line_Width,color,
    lineDashLength=0,lineDashSpacing=0,context=ctx){//util
    context.setLineDash([0, 0]);
    context.strokeStyle=color;
    context.lineWidth=width;
    context.setLineDash([lineDashLength,lineDashSpacing]);
    context.beginPath();
    context.moveTo(vertex1X, vertex1Y);
    context.lineTo(vertex2X,vertex2Y);
    context.stroke();
    context.setLineDash([0,0]);
}

function getAngleFromSlopeRatio(slopeRatio){
    return radiansToDegrees(Math.atan(slopeRatio));
}

function radiansToDegrees(rad){
    return (rad*180/Math.PI).toFixed(2);
}

function degreesToRadians(degrees){
    return (degrees*Math.PI/180);
}

function drawAllRoads(){
    for (i=0;i < roads.length;i++){
        roads[i].updateRoadInfo();
        roads[i].drawThisRoad();
    }
}

function canvasBkgColorFill(context=ctx){//util
    context.fillStyle = canvasBkgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function getLineAzimuthFromVertex(vertexX,vertexY,startXofLine,startYofLine,endXofLine,endYofLine,lineAngle){//util
    //lineAngle Goes from -90(vert. down) to +90(vert up). To be converted to Azimuth Angle.
    //lineAngle value is indifferent to whether the line is slanting to the left, or to the right(mirror of left)
    //console.log("angle is "+lineAngle);
    let azimuthBearing;
    
    let otherVertexOfLine=new Vertex();
    if(vertexX==startXofLine&&vertexY==startYofLine){
        otherVertexOfLine.x=endXofLine;
        otherVertexOfLine.y=endYofLine;
    }
    else{
        otherVertexOfLine.x=startXofLine;
        otherVertexOfLine.y=startYofLine;
        if(lineAngle==-90) lineAngle=90;
        else if(lineAngle==90) lineAngle=-90;
    }
        
    if(vertexX<=otherVertexOfLine.x){
        azimuthBearing=90-Number(lineAngle);
    }

    else{
        azimuthBearing=Number(270)-Number(lineAngle);
    }
    
    if(azimuthBearing==360){
        azimuthBearing=0; 
    }
    return azimuthBearing;

}

function drawCircularMarker(vertexX, vertexY, color="red",size=10,context=ctx){//util
    context.globalAlpha = 0.8;
    context.beginPath();
    context.arc(vertexX, vertexY, size, 0, 2 * Math.PI);
    context.fillStyle=color;
    context.fill();
    context.globalAlpha = 1;
}

function getAbsoluteDirectionFromRelativeDir(relativeDir,currentDirection){

    let absoluteDirection;

    switch(relativeDir){
        case "behind":
            absoluteDirection=currentDirection+180; 
            if(absoluteDirection>359){
                absoluteDirection-=360;
            }
        break;
        case "left":
            absoluteDirection=currentDirection-90; 
            if(absoluteDirection<0){
                absoluteDirection+=360;
            }
        break;
        case "right":
            absoluteDirection=currentDirection+90;  
            
            if(absoluteDirection>359){
                absoluteDirection-=360;
            }
            break;
        default:
            absoluteDirection=currentDirection;       
    }
    return absoluteDirection;
}

function getVectorGivenDirection_Magnitude(direction,magnitude){
    let vector={
        x:0,
        y:0
    };

    if(direction>=0&&direction<90){
        vector.x=Math.sin(degreesToRadians(direction));
        vector.y=-Math.cos(degreesToRadians(direction));

    }
    else if(direction>=90&&direction<180){
        vector.x=Math.cos(degreesToRadians(direction-90));
        vector.y=Math.sin(degreesToRadians(direction-90));

    }
    else if(direction>=180&&direction<270){
        vector.x=-Math.sin(degreesToRadians(direction-180));
        vector.y=Math.cos(degreesToRadians(direction-180));

    }
    else {//absoluteDirection>=270&&absoluteDirection<360
        vector.x=-Math.cos(degreesToRadians(direction-270));
        vector.y=-Math.sin(degreesToRadians(direction-270));
    }
    vector.x*=magnitude;
    vector.y*=magnitude;
    return vector;
}

function getDistanceBetweenTwoPoints(vertex1X,vertex1Y,vertex2X,vertex2Y){
    return Math.sqrt(Math.pow((vertex1X-vertex2X),2)+Math.pow((vertex1Y-vertex2Y),2));
}

function convertkmhToPixelsPerMillisecond(velocity){
    return velocity*1000/3600*pixelsPerMetre/1000;//kmh to m/h to m/s to pix/s to pix/millisecond
}

function convertMSsquaredToKMHsquared(MSsquared){
    return MSsquared*0.0000771604938;//conversion factor
}

function convertPixelsToMetres(pixels){
    return pixels/(laneWidth/cityLaneWidthIRL);
}

function convertKMHtoMS(kmh){
    return kmh/3.6;
}

function convertMStoKMH(ms){
    return ms*3.6;
}

function rotateObject(object, rotationInDeg){
    object.position.dir-=rotationInDeg;
}

function azimuthAToAzimuthBdiff(azimuthA, azimuthB){
    //console.log("azimuth A is "+azimuthA+" azimuth b is "+azimuthB);
    if(azimuthA<90 && azimuthB>180){
        return (azimuthB-(azimuthA+360));
    }

    else if (azimuthB<90 && azimuthA>180){
        return (azimuthA-(azimuthB+360));
    }

    else if (azimuthA<0){
        azimuthA+=360;
    }
    else 
        return azimuthA-azimuthB;
   
}

function azimuthMinusAngle(azimuth, angle){
    if(azimuth-angle<0)
        return azimuth-angle+360;
    
    else
        return azimuth-angle;
}

function getAngleFromAzimuth(azimuth){
    if(azimuth>=270){
        return azimuth-270;
    }
    else if(azimuth>=180){
        return azimuth-180;
    }
    else if(azimuth>=90){
        return azimuth-90;
    }
    else{
        return azimuth;
    }
}

function incrementAzimuthsBy360(azimuths){
    let incrementedAzimuths=[];
    for(i in azimuths){
        incrementedAzimuths.push(azimuths[i]+360);
    }
    return incrementedAzimuths;
}

function laneFromCenterLine(roadLanes, lanePos){
    if(roadLanes!=1)
        return lanePos-roadLanes/2;
    else
        return 1;           
}


