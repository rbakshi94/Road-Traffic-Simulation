document.getElementById("NoOfLanes").innerHTML = "Number of Lanes Selected: "+newRoadLanes;

function getMousePos(e){
    mousePos.x=e.pageX - canvas.offsetLeft;
    mousePos.y=e.pageY - canvas.offsetTop;
}

function drawCrossHair(){
    crosshairVertical.startX=mousePos.x;
    crosshairVertical.startY=mousePos.y-50;
    crosshairVertical.endX=mousePos.x;
    crosshairVertical.endY=mousePos.y+50;

    crosshairHorizontal.startX=mousePos.x-50;
    crosshairHorizontal.startY=mousePos.y;
    crosshairHorizontal.endX=mousePos.x+50;
    crosshairHorizontal.endY=mousePos.y;

    drawLine(crosshairVertical.startX,crosshairVertical.startY,
        crosshairVertical.endX,crosshairVertical.endY,line_Width,"red",0,0);
    drawLine(crosshairHorizontal.startX,crosshairHorizontal.startY,
        crosshairHorizontal.endX,crosshairHorizontal.endY,line_Width,"red",0,0);
}

function detectForRoadSelectionOrJunctionSnap(e){
    junctionSnapIsAvailable=false;
    let lineIntersectionInfoVertical;
    let lineIntersectionInfoHorizontal;
    let verticalCursorIntersectedRoadIndex=-1, horizontalCursorIntersectedRoadIndex=-1;
    hoveredRoadIndex=-1;
    hoveringOverRoad=false;
    let limit;
    if(creatingNewRoad) limit = activeRoadIndex;
    else limit=roads.length;

    for(i=0; i<limit;i++){
        lineIntersectionInfoVertical=getLinesIntersectionPt(crosshairVertical,roads[i]);

        lineIntersectionInfoHorizontal=getLinesIntersectionPt(crosshairHorizontal,roads[i]);

        if(lineIntersectionInfoVertical.theyIntersect){
            verticalCursorIntersectedRoadIndex=i;
            hoveringOverRoad=true; 
        }

        if(lineIntersectionInfoHorizontal.theyIntersect){
            horizontalCursorIntersectedRoadIndex=i;
            hoveringOverRoad=true;
        }

        if (hoveringOverRoad) i=limit;
    }

    if(hoveringOverRoad){
        //console.log("currently hovering over road");

        if(verticalCursorIntersectedRoadIndex!=-1){//vertical sensor intersecting with road line
            hoveredRoadIndex=verticalCursorIntersectedRoadIndex;
            junctionSnapVertex.x=crosshairVertical.startX+
            lineIntersectionInfoVertical.lambda*(crosshairVertical.endX-crosshairVertical.startX);
            junctionSnapVertex.y=crosshairVertical.startY+
            lineIntersectionInfoVertical.lambda*(crosshairVertical.endY-crosshairVertical.startY);


            if(Mode.subtype=="make road"){
                junctionSnapIsAvailable=true;
                junctionSnapVertex.lineID=hoveredRoadIndex;
                
                
                
                if(creatingNewRoad&&junctionSnapVertex.x==startVertex.x&&
                    junctionSnapVertex.y==startVertex.y){
                    junctionSnapIsAvailable=false;
                }
            }

        }
        if(horizontalCursorIntersectedRoadIndex!=-1){
            hoveredRoadIndex=horizontalCursorIntersectedRoadIndex;
            junctionSnapVertex.y=crosshairHorizontal.startY+
            lineIntersectionInfoHorizontal.lambda*(crosshairHorizontal.endY-crosshairHorizontal.startY);
            junctionSnapVertex.x=crosshairHorizontal.startX+
            lineIntersectionInfoHorizontal.lambda*(crosshairHorizontal.endX-crosshairHorizontal.startX);

            
            if(Mode.subtype=="make road"){
                junctionSnapIsAvailable=true;
                junctionSnapVertex.lineID=hoveredRoadIndex;  
                
                
                if(creatingNewRoad&&junctionSnapVertex.x==startVertex.x&&
                    junctionSnapVertex.y==startVertex.y){
                    junctionSnapIsAvailable=false;
                } 
            }
        }
        
        if(Mode.subtype=="selection mode"){
            console.log("highlighting hovered road");
            hoveredRoadHighlightedLine.startX=roads[hoveredRoadIndex].startX;
            hoveredRoadHighlightedLine.startY=roads[hoveredRoadIndex].startY;
            hoveredRoadHighlightedLine.endX=roads[hoveredRoadIndex].endX;
            hoveredRoadHighlightedLine.endY=roads[hoveredRoadIndex].endY;
           
        }
        else{
            hoveredRoadHighlightedLine.startX=0;
            hoveredRoadHighlightedLine.startY=0;
            hoveredRoadHighlightedLine.endX=0;
            hoveredRoadHighlightedLine.endY=0;
        }
        
    }   
}

function drawHoveredHighlightedLine(){

    drawLine(hoveredRoadHighlightedLine.startX,hoveredRoadHighlightedLine.startY,
        hoveredRoadHighlightedLine.endX,hoveredRoadHighlightedLine.endY,line_Width*1.6,"#00FFAE",0,0); 
}



function highlightSelectedRoads(){
    
    for(let i in selectedRoadsIndexes){
        drawLine(roads[selectedRoadsIndexes[i]].startX,roads[selectedRoadsIndexes[i]].startY,
            roads[selectedRoadsIndexes[i]].endX,roads[selectedRoadsIndexes[i]].endY,line_Width*1.6,"#00D1FF",0,0);
        }
}

function getNearestEndSnapVertex(e){
    let analyzedDistance,minDistance=100000;
    let nearestEndSnapVertex={x:0,y:0,roadID:0};
    let limit;
    if(creatingNewRoad) limit = activeRoadIndex;
    else limit=roads.length;
    
    for (i=0;i<limit;i++){
        
        if(getDistanceBetweenTwoPoints(roads[i].startX,roads[i].startY,mousePos.x,mousePos.y)<
        getDistanceBetweenTwoPoints(roads[i].endX,roads[i].endY,mousePos.x,mousePos.y)){
            analyzedDistance=getDistanceBetweenTwoPoints(roads[i].startX,roads[i].startY,mousePos.x,mousePos.y);
            if(analyzedDistance<minDistance) {
            minDistance=analyzedDistance;
            nearestEndSnapVertex.x=roads[i].startX;
            nearestEndSnapVertex.y=roads[i].startY;
            nearestEndSnapVertex.roadID=i;
            }
        }

        else{
            analyzedDistance=getDistanceBetweenTwoPoints(roads[i].endX,roads[i].endY,mousePos.x,mousePos.y);
            if(analyzedDistance<minDistance){
                minDistance=analyzedDistance;
                nearestEndSnapVertex.x=roads[i].endX;
                nearestEndSnapVertex.y=roads[i].endY;
                nearestEndSnapVertex.roadID=i;
            } 
        }
        
    }
    nearestEndSnapVertex.distFromCursor=minDistance;
    return nearestEndSnapVertex;
}

function detectEndSnapVertex(e){
    let nearestEndSnapVertex=getNearestEndSnapVertex(e);

    endLineSnapVertex.x=nearestEndSnapVertex.x;
    endLineSnapVertex.y=nearestEndSnapVertex.y; 
    endLineSnapVertex.roadID=nearestEndSnapVertex.roadID;
    endLineSnapVertex.distFromCursor=nearestEndSnapVertex.distFromCursor;
    //console.log(nearestEndSnapVertex.distFromCursor);
    if(nearestEndSnapVertex.distFromCursor<100){
        if(nearestEndSnapVertex.x!=startVertex.x&&
            nearestEndSnapVertex.y!=startVertex.y){
            endSnapIsAvailable=true; 
        }
        else if(!creatingNewRoad){
            endSnapIsAvailable=true; 
        }
        
    }
    else {
        endSnapIsAvailable=false;
    }
    //console.log(nearestEndSnapVertex);
}

function drawSuggestionAlignmentLine(){
    drawLine(suggestionAlignmentLine.startX,suggestionAlignmentLine.startY,
        suggestionAlignmentLine.endX,
        suggestionAlignmentLine.endY,line_Width*1.3,'#006FFF',4,10);
}

function changeRoad(){
   if(newRoadLanes==4){
    newRoadLanes=2;
   }
   else if(newRoadLanes==2){
       newRoadLanes=1;
   }
   else if(newRoadLanes==1){
       newRoadLanes=8;
   }
   else if(newRoadLanes==8){
       newRoadLanes=6;
   }
   else
        newRoadLanes=4;

    document.getElementById("NoOfLanes").innerHTML = "Number of Lanes Selected: "+newRoadLanes;
    
}

function deleteRoad(){
    console.log("number of lines to delete "+selectedRoadsIndexes.length);
    let numberOfSelectedRoads=selectedRoadsIndexes.length;


    selectedRoadsIndexes.sort(function(a, b) {
        return a - b;
      });
      
      
    selectedRoadsIndexes.reverse();
    for(let i in selectedRoadsIndexes){
        
        console.log(selectedRoadsIndexes[i]);
        roads.splice((selectedRoadsIndexes[i]),1);
        
    }
    drawnRoadsCount-=numberOfSelectedRoads;
    console.log(selectedRoadsIndexes);
    selectedRoadsIndexes=[];
    hoveredRoadHighlightedLine.startX=0;
    hoveredRoadHighlightedLine.startY=0;
    hoveredRoadHighlightedLine.endX=0;
    hoveredRoadHighlightedLine.endY=0;
}

function selectionMode(){
    if (Mode.subtype=="make road"){
        Mode.subtype="selection mode";
    }
    else {
        Mode.subtype="make road";
        selectedRoadsIndexes=[];
    }
}

function ChangeTool(toolClicked){
    document.getElementById('open').className="";
    document.getElementById('save').className="";
    document.getElementById('line').className="";
    document.getElementById(toolClicked).className='selected';
    currentTool=toolClicked;
}

function toggleEditOrSimulateMode(){
    if (Mode.type=="edit"){
        Mode.type="simulate";
        Mode.subtype="none";
        vehiclesCanvas.style.display="block";
    }
    
    else {
        Mode.type="edit";
        Mode.subtype="make road";
        vehiclesCanvas.style.display="none";
        simulationInitialized=false;
    }
    console.log(Mode.type,Mode.subtype);
}




      
