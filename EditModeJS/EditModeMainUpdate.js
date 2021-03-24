let canvas, vehiclesCanvas;
let ctx, ctx2;
let dragging=false;
let strokeColor='black';
let fillColor='black';
let line_Width=3;
let currentTool='brush';
let roads=[];
let drawnRoadsCount=0;
let activeRoad;
let canvasBkgColor="#3C4347";//#82C7A0 AECABA A7C1BB  C0C1B8 C3C3BF D8D8D6 //darker: 
let whiteLineColor="#E1E1E1";
let yellowLineColor="#FAD640";
let roadColor="#465259"; //lighter color #758B9A
let laneWidth=23;
let cityLaneWidthIRL=3.3528;//m (11.0 ft)
let pixelsPerMetre=laneWidth/cityLaneWidthIRL; //

let nearestVertIndex=0;
let endSnapIsAvailable=false, hoveringOverRoad=false, junctionSnapIsAvailable=false;
let newRoadLanes=4;
let hoveredRoadIndex=-1;
let selectedRoadsIndexes=[];
let selectingRoad=false;
let creatingNewRoad=false;
let activeRoadIndex=0;
let straightTransitionTaperLength=3*laneWidth;
let Mode={type:"edit",subtype:"make road"};
let curveRadius=350;
let intersectionTurnRadius=23;
let roadAngleMatchDetectInfo={angleMatchMode:false,connectedRoadID:0};
let roadJoinsArray=[];
let roadBends=[];
let straightConnections=[];
let transitions=[];
let intersections=[];
let controlVolumeBorderVertices=[];

let snapInfo={snapAvailable:false,snapType:"none"};
let startVertex=new Vertex();
let currentVertex=new Vertex();
let endLineSnapVertex= new Vertex();
let junctionSnapVertex=new Vertex();
let snapVertex={x:0,y:0,roadID:0};
let mousePos= new Vertex();
let crosshairHorizontal=new Line();
let crosshairVertical=new Line();
let suggestionAlignmentLine=new Line();
let hoveredRoadHighlightedLine=new Line();

document.addEventListener('DOMContentLoaded', setupCanvas);


function setupCanvas(){
    canvas=document.getElementById("map-canvas");
    ctx=canvas.getContext('2d');
    ctx.lineWidth=line_Width;

    canvasBkgColorFill();
    canvas.addEventListener("mousedown",ReactToMouseDown);
    canvas.addEventListener("mousemove",ReactToMouseMove);
    canvas.addEventListener("mouseup",ReactToMouseUp);
}



function ReactToMouseDown(e){

    if(Mode.subtype=="make road"){
        dragging=true;
        initializeNewRoad(e);
    }

    else{ //in selection mode
        toggleSelectionOfElement();
    }

}

function ReactToMouseMove(e){
    
    getMousePos(e);
    
    getSnapInfo(e);
    
    if(creatingNewRoad){
        recordCurrentVertex(e);
        assignVerticesToActiveRoad();
    }
    drawMapCanvasScene();
    
}

function ReactToMouseUp(e){
    if(creatingNewRoad&&snapInfo.snapAvailable){
        roads[activeRoadIndex].endX=snapVertex.x; 
        roads[activeRoadIndex].endY=snapVertex.y;
        roads[activeRoadIndex].updateRoadInfo();
        if(snapInfo.snapType=="Junction Snap"){
            splitJunctionRoads();
        }
    }
    
    resetStateVariables();
    getRoadJoins();
    drawMapCanvasScene();
}


function initializeNewRoad(e){
    drawnRoadsCount++;
    let newRoad=new Road(0,0,0,0,0, newRoadLanes);
    roads[drawnRoadsCount-1]=newRoad;
    activeRoad=roads[drawnRoadsCount-1];
    activeRoadIndex=drawnRoadsCount-1;
    //console.log("new road added");
    recordStartVertex(e); //and split junction lines if appropriate
    creatingNewRoad=true;
}

function recordStartVertex(e){
    roadAngleMatchDetectInfo.angleMatchMode=false;
    if(snapInfo.snapAvailable){
        startVertex.x=snapVertex.x;
        startVertex.y=snapVertex.y;
        if(snapInfo.snapType=="Junction Snap"){
            splitJunctionRoads();
        }
        else if(snapInfo.snapType=="End Line Snap"){
            roadAngleMatchDetectInfo.angleMatchMode=true;
            roadAngleMatchDetectInfo.connectedRoadID=snapVertex.roadID;
        }
    }
    else{
        startVertex.x=e.pageX - canvas.offsetLeft;
        startVertex.y=e.pageY - canvas.offsetTop;
    }

}

function recordCurrentVertex(e){
    
    let slope=-1*(mousePos.y-startVertex.y)/(mousePos.x-startVertex.x);
    let angleFromStartToCurrentVertex=getAngleFromSlopeRatio(slope);
    let azimuthFromStartToCurrentVertex=getLineAzimuthFromVertex(mousePos.x,mousePos.y,startVertex.x,startVertex.y,
        mousePos.x, mousePos.y,angleFromStartToCurrentVertex);
    //console.log(roadAngleMatchDetectInfo.angleMatchMode);
    let angleForTanFunc=roads[roadAngleMatchDetectInfo.connectedRoadID].angle;
    angleForTanFunc+=180;
    if(roadAngleMatchDetectInfo.angleMatchMode&&
        ((Math.abs(azimuthAToAzimuthBdiff(azimuthFromStartToCurrentVertex,azimuthMinusAngle(roads[roadAngleMatchDetectInfo.connectedRoadID].dir,180)))<=10)||
    (Math.abs(azimuthAToAzimuthBdiff(azimuthFromStartToCurrentVertex,roads[roadAngleMatchDetectInfo.connectedRoadID].dir))<=10))){
        currentVertex.y=e.pageY - canvas.offsetTop;
        currentVertex.x=startVertex.x
        +(e.pageY - canvas.offsetTop-startVertex.y)*(Math.tan(degreesToRadians(angleForTanFunc-90)));   
        //*Math.tan(degreesToRadians(90-(getAngleFromAzimuth(azimuthFromStartToCurrentVertex))));
        //console.log(angleForTanFunc);
    }

    else if (Math.abs(angleFromStartToCurrentVertex)<=10){

        currentVertex.x=e.pageX - canvas.offsetLeft;
        currentVertex.y=startVertex.y;
    }

    else if (Math.abs(angleFromStartToCurrentVertex)>=80){
          
        currentVertex.y=e.pageY - canvas.offsetTop;
        currentVertex.x=startVertex.x;
    }

    else {
            
        currentVertex.x=e.pageX - canvas.offsetLeft;
        currentVertex.y=e.pageY - canvas.offsetTop;

    }

}

function assignVerticesToActiveRoad(){
    activeRoad.startX=startVertex.x;
    activeRoad.startY=startVertex.y;
    activeRoad.endX=currentVertex.x;
    activeRoad.endY=currentVertex.y;
    activeRoad.dir=getLineAzimuthFromVertex(activeRoad.startX,activeRoad.startY,activeRoad.startX,
        activeRoad.startY,activeRoad.endX,activeRoad.endY,activeRoad.angle);
    activeRoad.oppositeDir=getLineAzimuthFromVertex(activeRoad.endX,activeRoad.endY,activeRoad.endX,activeRoad.endY,
        activeRoad.startX,activeRoad.startY,activeRoad.angle);
}



function toggleSelectionOfElement(){
    if(hoveringOverRoad){
        if(selectedRoadsIndexes.indexOf(hoveredRoadIndex)==-1&&Mode.subtype=="selection mode"){
            selectedRoadsIndexes.push(hoveredRoadIndex);
            selectingRoad=true;
            highlightSelectedRoads();
        }
    
        else {
            selectingRoad=false;
            selectedRoadsIndexes.splice(selectedRoadsIndexes.indexOf(hoveredRoadIndex),1);
            detectForRoadSelectionOrJunctionSnap();
        }
        highlightSelectedRoads();
    }
}

function drawMapCanvasScene(){
    clearCanvas();
    canvasBkgColorFill();
    drawAllRoads();
    drawRoadJoins();
    if(!dragging){
        drawHoveredHighlightedLine();
    }
    drawCrossHair();

    if(!dragging){
        if(Mode.subtype=="selection mode"){
        highlightSelectedRoads();
        }  
    }

    if(snapInfo.snapAvailable){
        if(snapInfo.snapType=="End Line Snap"){
            drawCircularMarker(snapVertex.x,snapVertex.y,'#FF7706',10);
        }
        else drawCircularMarker(snapVertex.x,snapVertex.y,'#2EDF19',10);
    }
}

function getSnapInfo(e){
    snapInfo.snapAvailable=false;
    snapInfo.snapType="";
    junctionSnapIsAvailable=endSnapIsAvailable=false;
    detectForRoadSelectionOrJunctionSnap(e);
    detectEndSnapVertex();
    if(Mode.subtype=="make road"){
        if(junctionSnapIsAvailable&&endSnapIsAvailable){
            if(getDistanceBetweenTwoPoints(junctionSnapVertex.x,junctionSnapVertex.y,mousePos.x,mousePos.y)<
            getDistanceBetweenTwoPoints(endLineSnapVertex.x,endLineSnapVertex.y,mousePos.x,mousePos.y)){
                snapVertex.x=junctionSnapVertex.x;
                snapVertex.y=junctionSnapVertex.y;
                snapInfo.snapAvailable=true;
                snapInfo.snapType="Junction Snap";
            }
            else{
                snapVertex.x=endLineSnapVertex.x;
                snapVertex.y=endLineSnapVertex.y;
                snapVertex.roadID=endLineSnapVertex.roadID;
                snapInfo.snapAvailable=true;
                snapInfo.snapType="End Line Snap";
            }
        }

        else if(junctionSnapIsAvailable){
            snapVertex.x=junctionSnapVertex.x;
                snapVertex.y=junctionSnapVertex.y;
                snapInfo.snapAvailable=true;
                snapInfo.snapType="Junction Snap";
        }

        else if(endSnapIsAvailable){
            snapVertex.x=endLineSnapVertex.x;
            snapVertex.y=endLineSnapVertex.y;
            snapVertex.roadID=endLineSnapVertex.roadID;
            snapInfo.snapAvailable=true;
            snapInfo.snapType="End Line Snap";
        }

        else{
            snapInfo.snapAvailable=false; 
        }
        
    }
}

function resetStateVariables(){
    dragging=false;    
    creatingNewRoad=false;
    if(Mode.subtype=="selection mode") selectingRoad=false;
    startVertex.x=startVertex.y=currentVertex.x=currentVertex.y=0;
}













