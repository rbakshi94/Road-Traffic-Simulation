//map processing
function splitJunctionRoads(){//splits the line being intersected and adds the new split line to the end of lines array
    let splitJunctionRoad1=new Road(roads[junctionSnapVertex.lineID].startX,
                                    roads[junctionSnapVertex.lineID].startY,
                                    junctionSnapVertex.x,junctionSnapVertex.y,
                                    roads[junctionSnapVertex.lineID].angle,
                                    roads[junctionSnapVertex.lineID].lanes
                                    );

    roads[junctionSnapVertex.lineID].startX=junctionSnapVertex.x;
    roads[junctionSnapVertex.lineID].startY=junctionSnapVertex.y;

    roads.push(splitJunctionRoad1);
        drawnRoadsCount+=1;
        creatingNewRoad=false;
}
//map processing
function getRoadJoins(){//gets all vertices in the map where one road line connects with another and puts into roadJoinsArray.
    //It does so by comparing the vertices of one line with vertices of every other line. Two RoadJoinVertex class objects are
    //instantiated each time a line (i) is compared with all other lines. The objects contain the start and end vertices of
    //the line being examined. Each roadJoinsVertex object is checked to see what other lines (if any) share the same coordinates
    //for one of their vertices. If roadJoinsVertex object has for ex., 3 other vertices sharing its coordinates, then its line4ID
    //proprty is assigned the 3rd found line's ID and changed from -1 (which would mean that less than 3 other lines share the 
    //object's vertex)
    roadJoinsArray=[];
    
    for (i=0; i<roads.length;i++){
        //console.log("examining vertices for line "+i);
        let examinedRoadStartVertex=new RoadJoinsVertex(roads[i].startX,roads[i].startY,
            []);
        let examinedRoadEndVertex=new RoadJoinsVertex(roads[i].endX,roads[i].endY,
            []);

            examinedRoadStartVertex.joinRoad.push({angle:roads[i].angle,lanes:roads[i].lanes,dir:0,roadID:i});
            examinedRoadEndVertex.joinRoad.push({angle:roads[i].angle,lanes:roads[i].lanes,dir:0,roadID:i});
        examinedRoadStartVertex.joinRoad[0].dir=getLineAzimuthFromVertex(
            examinedRoadStartVertex.x,examinedRoadStartVertex.y,
            examinedRoadStartVertex.x,examinedRoadStartVertex.y, examinedRoadEndVertex.x,examinedRoadEndVertex.y,roads[i].angle);    
        
        examinedRoadEndVertex.joinRoad[0].dir=getLineAzimuthFromVertex(
            examinedRoadEndVertex.x,examinedRoadEndVertex.y,
            examinedRoadStartVertex.x,examinedRoadStartVertex.y, examinedRoadEndVertex.x,examinedRoadEndVertex.y,roads[i].angle);    


        for(j=i+1; j<roads.length;j++){
            
                if((roads[i].startX==roads[j].endX && roads[i].startY==roads[j].endY)
                || (roads[i].startX==roads[j].startX && roads[i].startY==roads[j].startY)) {

                    examinedRoadStartVertex.joinRoad.push({angle:roads[j].angle,lanes:roads[j].lanes,dir:0,roadID:j});
                    examinedRoadStartVertex.joinRoad[examinedRoadStartVertex.joinRoad.length-1].dir=getLineAzimuthFromVertex(
                        examinedRoadStartVertex.x,examinedRoadStartVertex.y,
                        roads[j].startX, roads[j].startY, roads[j].endX,roads[j].endY,
                        examinedRoadStartVertex.joinRoad[examinedRoadStartVertex.joinRoad.length-1].angle);
                    

                    if(examinedRoadStartVertex.joinRoad.length==2){
                        if(examinedRoadStartVertex.joinRoad[0].lanes==examinedRoadStartVertex.joinRoad[1].lanes&&
                            examinedRoadStartVertex.joinRoad[0].angle==examinedRoadStartVertex.joinRoad[1].angle){
                                
                                examinedRoadStartVertex.joinType="straight connection";
                            }
                        else if(examinedRoadStartVertex.joinRoad[0].lanes==examinedRoadStartVertex.joinRoad[1].lanes&&
                        Math.abs(examinedRoadStartVertex.joinRoad[0].angle)!=Math.abs(examinedRoadStartVertex.joinRoad[1].angle)){

                        examinedRoadStartVertex.joinType="road bend";
                        }
                        else if(examinedRoadStartVertex.joinRoad[0].lanes!=examinedRoadStartVertex.joinRoad[1].lanes&&
                            Math.abs(examinedRoadStartVertex.joinRoad[0].angle)==Math.abs(examinedRoadStartVertex.joinRoad[1].angle)){
                        examinedRoadStartVertex.joinType="transition";
                        }
                    }

                    else if(examinedRoadStartVertex.joinRoad.length>=3){
                        
                        examinedRoadStartVertex.joinType="intersection";
                        
                    }

                }
                if((roads[i].endX==roads[j].endX && roads[i].endY==roads[j].endY)
                || (roads[i].endX==roads[j].startX && roads[i].endY==roads[j].startY)) {

                    examinedRoadEndVertex.joinRoad.push({angle:roads[j].angle,lanes:roads[j].lanes,dir:0,roadID:j});
                    examinedRoadEndVertex.joinRoad[examinedRoadEndVertex.joinRoad.length-1].dir=getLineAzimuthFromVertex(
                        examinedRoadEndVertex.x,examinedRoadEndVertex.y,
                        roads[j].startX, roads[j].startY, roads[j].endX,roads[j].endY,
                        roads[j].angle);
                        

                    if(examinedRoadEndVertex.joinRoad.length==2){
                        
                        if(examinedRoadEndVertex.joinRoad[0].lanes==examinedRoadEndVertex.joinRoad[1].lanes&&
                            examinedRoadEndVertex.joinRoad[0].angle==examinedRoadEndVertex.joinRoad[1].angle){
                                
                                examinedRoadEndVertex.joinType="straight connection";
                            }
                        else if(examinedRoadEndVertex.joinRoad[0].lanes==examinedRoadEndVertex.joinRoad[1].lanes&&
                            Math.abs(examinedRoadEndVertex.joinRoad[0].angle)!=Math.abs(examinedRoadEndVertex.joinRoad[1].angle)){

                        examinedRoadEndVertex.joinType="road bend";
                        }
                        else if(examinedRoadEndVertex.joinRoad[0].lanes!=examinedRoadEndVertex.joinRoad[1].lanes&&
                            Math.abs(examinedRoadEndVertex.joinRoad[0].angle)==Math.abs(examinedRoadEndVertex.joinRoad[1].angle)){
                        examinedRoadEndVertex.joinType="transition";
                        }

                    }
                    else if (examinedRoadEndVertex.joinRoad.length>=3){
                       
                        examinedRoadEndVertex.joinType="intersection";
                    }

                }              
 
        }
        if(typeof(examinedRoadStartVertex.joinRoad[1])!="undefined"){
            //console.log("pushing start vertex for line "+i );
            roadJoinsArray.push(examinedRoadStartVertex);
        }
        if(typeof(examinedRoadEndVertex.joinRoad[1])!="undefined"){
            //console.log("pushing end vertex for line "+i);
            roadJoinsArray.push(examinedRoadEndVertex);
        }
        
    } 

    removeRoadJoinsArrayOfDuplicates();
}

//map processing
function removeRoadJoinsArrayOfDuplicates(){
    let deletionIndexes=[];
    for (i=0; i<roadJoinsArray.length;i++){

        for(j=i+1;j<roadJoinsArray.length;j++){
            
            if (roadJoinsArray[i].x==roadJoinsArray[j].x&&roadJoinsArray[i].y==roadJoinsArray[j].y){
                deletionIndexes.push(j);
            }  
        }
    }
    deletionIndexes.sort(function(a, b) {
        return a - b;
    });
      
    deletionIndexes.reverse();

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
      
    deletionIndexes = deletionIndexes.filter(onlyUnique);

    for(let i in deletionIndexes){
        roadJoinsArray.splice((deletionIndexes[i]),1);
    }
}
//map processing
function drawRoadJoins(){
    let rectWidth,rectHeight;
    let orientation="";
    //console.log("No. of joins "+roadJoinsArray.length);
    
    for (let i in roadJoinsArray){
        //console.log(roadJoinsArray[i].joinType);
        rectWidth=rectHeight=0;
        
        
        if(roadJoinsArray[i].joinType=="road bend"){
            drawRoadBend(roadJoinsArray[i]);
        }

        else if(roadJoinsArray[i].joinType=="intersection"){
            drawIntersection(roadJoinsArray[i]);
        }
 
        else if(roadJoinsArray[i].joinType=="transition"){
            drawTransition(roadJoinsArray[i]);
        }   
            
    }
}

function getControlVolumeBorderPts(){//map processing
    controlVolumeBorderVertices=[];
    let startVertexIsRoadJoinVertex=false;
    let endVertexIsRoadJoinVertex=false;

    for (let i in roads){
        for(let j in roadJoinsArray){
            if((roads[i].startX==roadJoinsArray[j].x&&roads[i].startY==roadJoinsArray[j].y)){
                startVertexIsRoadJoinVertex=true;
            }
            
            if(roads[i].endX==roadJoinsArray[j].x&&roads[i].endY==roadJoinsArray[j].y){
                endVertexIsRoadJoinVertex=true;
            }
        }

        if (startVertexIsRoadJoinVertex==false){
            let borderVertex={
                x:roads[i].startX, y:roads[i].startY,
                initialDir:getLineAzimuthFromVertex(roads[i].startX,roads[i].startY,
                    roads[i].startX,roads[i].startY,roads[i].endX,roads[i].endY,roads[i].angle),
                
                roadID:i
            };
            controlVolumeBorderVertices.push(borderVertex);
        }

        if (endVertexIsRoadJoinVertex==false){
            let borderVertex={
                x:roads[i].endX, y:roads[i].endY,
                initialDir:getLineAzimuthFromVertex(roads[i].endX,roads[i].endY,
                    roads[i].startX,roads[i].startY,roads[i].endX,roads[i].endY,roads[i].angle),
                    roadID:i
            };
            controlVolumeBorderVertices.push(borderVertex);
        }
        startVertexIsRoadJoinVertex=false;
        endVertexIsRoadJoinVertex=false;
    }

    for(let i in controlVolumeBorderVertices){
        console.log("CV vertices are "+controlVolumeBorderVertices[i].x,controlVolumeBorderVertices[i].y,
            controlVolumeBorderVertices[i].initialDir);
            //drawCircularMarker(controlVolumeBorderVertices[i].x,controlVolumeBorderVertices[i].y,
            //    "red",10,ctx2);
    }
}

function drawRoadBend(joinVertex){
    let curveSize;

    let middleAngle=0;
    middleAngle=(joinVertex.joinRoad[0].dir+joinVertex.joinRoad[1].dir)/2;
    let angle1=joinVertex.joinRoad[0].dir;
    let angle2=joinVertex.joinRoad[1].dir;
 
    //console.log(joinVertex.joinRoad[0].dir,joinVertex.joinRoad[1].dir);
    if(Math.abs(angle1-angle2)>180){
        middleAngle+=180;
    }
    if(middleAngle>360){
        middleAngle-=360;
    }
    

    if(angle2==0)angle2=360;
    if(angle2<angle1){
        let temp;
        temp=angle1;
        angle1=angle2;
        angle2=temp;
    }

 
    curveSize=curveRadius/Math.sin((degreesToRadians(middleAngle-angle1)));
   

    curveSize=Math.abs(curveSize);
    //console.log("curve Radius is "+curveSize);
    let curveCentroid=new Vertex();
    let angle;
    if(middleAngle<=90){
        angle=middleAngle;
        curveCentroid.y=joinVertex.y-curveSize*Math.cos(degreesToRadians(angle));
        curveCentroid.x=joinVertex.x+curveSize*Math.sin(degreesToRadians(angle));
    }
    else if(middleAngle>90&&middleAngle<=180){
        angle=middleAngle-90;
        curveCentroid.x=joinVertex.x+curveSize*Math.cos(degreesToRadians(angle));
        curveCentroid.y=joinVertex.y+curveSize*Math.sin(degreesToRadians(angle));
    }
    else if(middleAngle>180&&middleAngle<=270){
        angle=middleAngle-180;
        curveCentroid.y=joinVertex.y+curveSize*Math.cos(degreesToRadians(angle));
        curveCentroid.x=joinVertex.x-curveSize*Math.sin(degreesToRadians(angle));
    }
    else{
        angle=middleAngle-270;
        curveCentroid.x=joinVertex.x-curveSize*Math.cos(degreesToRadians(angle));
        curveCentroid.y=joinVertex.y-curveSize*Math.sin(degreesToRadians(angle));
    }

    joinVertex.bendCentroid={x:curveCentroid.x,y:curveCentroid.y};
    //drawCircularMarker(curveCentroid.x,curveCentroid.y,"blue");
    let deletionDistance=curveSize*Math.cos(degreesToRadians(middleAngle-angle1))

    //drawing mask
    ctx.translate( joinVertex.x, joinVertex.y);
    ctx.rotate((joinVertex.joinRoad[0].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
    ctx.translate(-joinVertex.x, -joinVertex.y);

    drawLine(joinVertex.x,joinVertex.y,joinVertex.x,joinVertex.y+deletionDistance,
        laneWidth*joinVertex.joinRoad[0].lanes*1.1,canvasBkgColor,0,0);
    
    ctx.translate( joinVertex.x, joinVertex.y);
    ctx.rotate((-joinVertex.joinRoad[0].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
    ctx.translate(-joinVertex.x, -joinVertex.y);  

    
    ctx.translate( joinVertex.x, joinVertex.y);
    ctx.rotate((joinVertex.joinRoad[1].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
    ctx.translate(-joinVertex.x, -joinVertex.y);

    drawLine(joinVertex.x,joinVertex.y,joinVertex.x,joinVertex.y+deletionDistance,
        laneWidth*joinVertex.joinRoad[0].lanes*1.1,canvasBkgColor,0,0);
    
    ctx.translate( joinVertex.x, joinVertex.y);
    ctx.rotate((-joinVertex.joinRoad[1].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
    ctx.translate(-joinVertex.x, -joinVertex.y); 

    if(Math.abs(angle1-angle2)>180){
        curveArcRange=Math.abs(angle1-angle2);
        ctx.beginPath();
        ctx.lineWidth=laneWidth*joinVertex.joinRoad[0].lanes;
        ctx.arc(curveCentroid.x, curveCentroid.y, curveSize*Math.sin(degreesToRadians((angle1-middleAngle))), 
        2*Math.PI*(angle1)/360, 2 * Math.PI*(angle2-180)/360);
        ctx.strokeStyle=roadColor;
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth=line_Width;
        ctx.arc(curveCentroid.x, curveCentroid.y, 
            curveSize*Math.sin(degreesToRadians((angle1-middleAngle)))+laneWidth*joinVertex.joinRoad[0].lanes/2, 
        2*Math.PI*(angle1)/360, 2 * Math.PI*(angle2-180)/360);
        ctx.strokeStyle=whiteLineColor;
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth=line_Width;
        ctx.arc(curveCentroid.x, curveCentroid.y, 
            curveSize*Math.sin(degreesToRadians((angle1-middleAngle)))-laneWidth*joinVertex.joinRoad[0].lanes/2, 
        2*Math.PI*(angle1)/360, 2 * Math.PI*(angle2-180)/360);
        ctx.strokeStyle=whiteLineColor;
        ctx.stroke();


        if(joinVertex.joinRoad[0].lanes>1){
            ctx.beginPath();
            ctx.lineWidth=line_Width;
            ctx.arc(curveCentroid.x, curveCentroid.y, curveSize*Math.sin(degreesToRadians((angle1-middleAngle))), 
            2*Math.PI*(angle1)/360, 2 * Math.PI*(angle2-180)/360);
            ctx.strokeStyle=yellowLineColor;
            ctx.stroke();
        
        
            if(joinVertex.joinRoad[0].lanes>2){
                let i;
                for(i=1;i<=joinVertex.joinRoad[0].lanes/2-1;i++){
                    ctx.setLineDash([20,25]);
                    
                    ctx.beginPath();
                    ctx.lineWidth=line_Width;
                    ctx.arc(curveCentroid.x, curveCentroid.y, 
                        curveSize*Math.sin(degreesToRadians((angle1-middleAngle)))+laneWidth*i, 
                    2*Math.PI*(angle1)/360, 2 * Math.PI*(angle2-180)/360);
                    ctx.strokeStyle=whiteLineColor;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.lineWidth=line_Width;
                    ctx.arc(curveCentroid.x, curveCentroid.y, 
                        curveSize*Math.sin(degreesToRadians((angle1-middleAngle)))-laneWidth*i, 
                    2*Math.PI*(angle1)/360, 2 * Math.PI*(angle2-180)/360);
                    ctx.strokeStyle=whiteLineColor;
                    ctx.stroke();

                    ctx.setLineDash([0,0]);

                }
            }
        }

    }
    else{
        curveArcRange=Math.abs(angle1-angle2);
        ctx.beginPath();
        ctx.lineWidth=laneWidth*joinVertex.joinRoad[0].lanes;
        ctx.arc(curveCentroid.x, curveCentroid.y, curveSize*Math.sin(degreesToRadians(Math.abs(middleAngle-angle1))), 
        2*Math.PI*(angle2)/360, 2 * Math.PI*(angle1+180)/360);
        ctx.strokeStyle=roadColor;
        ctx.stroke();

        curveArcRange=Math.abs(angle1-angle2);
        ctx.beginPath();
        ctx.lineWidth=line_Width;
        ctx.arc(curveCentroid.x, curveCentroid.y, 
            curveSize*Math.sin(degreesToRadians(Math.abs(middleAngle-angle1)))+laneWidth*joinVertex.joinRoad[0].lanes/2, 
        2*Math.PI*(angle2)/360, 2 * Math.PI*(angle1+180)/360);
        ctx.strokeStyle=whiteLineColor;
        ctx.stroke();

        curveArcRange=Math.abs(angle1-angle2);
        ctx.beginPath();
        ctx.lineWidth=line_Width;
        ctx.arc(curveCentroid.x, curveCentroid.y, 
            curveSize*Math.sin(degreesToRadians(Math.abs(middleAngle-angle1)))-laneWidth*joinVertex.joinRoad[0].lanes/2, 
        2*Math.PI*(angle2)/360, 2 * Math.PI*(angle1+180)/360);
        ctx.strokeStyle=whiteLineColor;
        ctx.stroke();


        if(joinVertex.joinRoad[0].lanes>1){
            ctx.beginPath();
            ctx.lineWidth=line_Width;
            ctx.arc(curveCentroid.x, curveCentroid.y, curveSize*Math.sin(degreesToRadians(Math.abs(middleAngle-angle1))), 
            2*Math.PI*(angle2)/360, 2 * Math.PI*(angle1+180)/360);
            ctx.strokeStyle=yellowLineColor;
            ctx.stroke();

            if(joinVertex.joinRoad[0].lanes>2){
                let i;
                for(i=1;i<=joinVertex.joinRoad[0].lanes/2-1;i++){
                    ctx.setLineDash([20,25]);
                    
                    ctx.beginPath();
                    ctx.lineWidth=line_Width;
                    ctx.arc(curveCentroid.x, curveCentroid.y, 
                        curveSize*Math.sin(degreesToRadians(Math.abs(middleAngle-angle1)))+laneWidth*i, 
                        2*Math.PI*(angle2)/360, 2 * Math.PI*(angle1+180)/360);
                    ctx.strokeStyle=whiteLineColor;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.lineWidth=line_Width;
                    ctx.arc(curveCentroid.x, curveCentroid.y, 
                        curveSize*Math.sin(degreesToRadians(Math.abs(middleAngle-angle1)))-laneWidth*i, 
                        2*Math.PI*(angle2)/360, 2 * Math.PI*(angle1+180)/360);
                    ctx.strokeStyle=whiteLineColor;
                    ctx.stroke();

                    ctx.setLineDash([0,0]);

                }
            }
        }
       
    }
}

function drawIntersection(joinVertex){

    let deletionDistance=0;
    let halfRoadWidth=0;
    for(let i in joinVertex.joinRoad){
        
        halfRoadWidth=joinVertex.joinRoad[i].lanes*laneWidth/2*Math.sqrt(2);
        if(halfRoadWidth>deletionDistance){
            deletionDistance=halfRoadWidth;
        }
    }
    deletionDistance*=1.2;
    
    //Adding margin to deletion distance if angle of any 2 roads in intersection is small (less than 90)
    //Otherwise overlapping woud occur and the intersection doesn't look right
    let smallestAngleDifference=360;
    let angleDifference;
    for(let i in joinVertex.joinRoad){
        for(let j=i; j<joinVertex.joinRoad.length;j++){
            if(i!=j){
                angleDifference=Math.abs(joinVertex.joinRoad[i].dir-joinVertex.joinRoad[j].dir);
                
                //dealing with the 359-0 degree discontinuity if exists
                if((joinVertex.joinRoad[i].dir>270&&joinVertex.joinRoad[j].dir<90)||
                (joinVertex.joinRoad[j].dir>270&&joinVertex.joinRoad[i].dir<90)){
                    angleDifference-=360;
                    angleDifference=Math.abs(angleDifference);
                }
                if(Math.abs(angleDifference<smallestAngleDifference)){
                    smallestAngleDifference=angleDifference;
                }
            }
            
        }
    }

    

    let extraDeletionMargin=0;
    if(smallestAngleDifference<90){
        extraDeletionMargin=13*1/smallestAngleDifference;//10 is a coefficient
        //console.log(extraDeletionMargin);
        deletionDistance*=(extraDeletionMargin+1);
        deletionDistance*=(extraDeletionMargin+1);//repeated to multiply extraMargin+1 ^2
    }
    joinVertex.stopLineDistanceFromCenter=deletionDistance;
   

    //Take care of the "unpaved" region of the intersection that is seen if all lines in the intersection
    //are less than say, 170 degree arc slice

    //Finding the middle angle of two roads that have the maximum angle difference between each other
    let largestAngleDifference=0;
    let roadN,roadM;
    for(let i in joinVertex.joinRoad){
        for(let j=i; j<joinVertex.joinRoad.length;j++){
            if(i!=j){
                angleDifference=Math.abs(joinVertex.joinRoad[i].dir-joinVertex.joinRoad[j].dir);
                if(angleDifference>270){
                    angleDifference=360-angleDifference;
                }
                if(Math.abs(angleDifference>largestAngleDifference)){
                    largestAngleDifference=angleDifference;
                    roadN=joinVertex.joinRoad[i];
                    roadM=joinVertex.joinRoad[j];
                }
            }
        }
    }

    let middleAngle=(roadN.dir+roadM.dir)/2;
    let angle1=roadN.dir;
    let angle2=roadM.dir;
    
    if(Math.abs(angle1-angle2)>180){
        middleAngle+=180;
    }
    if(middleAngle>360){
        middleAngle-=360;
    }
   
    for(let i in joinVertex.joinRoad){
        if(joinVertex.joinRoad[i]==roadN||joinVertex.joinRoad[i]==roadM){
            let roadPerpendicularDir=joinVertex.joinRoad[i].dir-90;

            if(roadPerpendicularDir<0){
                roadPerpendicularDir+=360;
            }
            

            let patchingDistance=joinVertex.joinRoad[i].lanes*
            laneWidth/2*Math.tan(degreesToRadians(Math.abs(middleAngle-roadPerpendicularDir)));
            //console.log( middleAngle,joinVertex.joinRoad[i].dir);
            ctx.translate( joinVertex.x, joinVertex.y);
            ctx.rotate((joinVertex.joinRoad[i].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
            ctx.translate(-joinVertex.x, -joinVertex.y);

            drawLine(joinVertex.x,joinVertex.y,joinVertex.x,joinVertex.y-patchingDistance,
                laneWidth*joinVertex.joinRoad[i].lanes+line_Width,whiteLineColor,0,0);
            drawLine(joinVertex.x,joinVertex.y,joinVertex.x,joinVertex.y+patchingDistance,
                laneWidth*joinVertex.joinRoad[i].lanes+line_Width,whiteLineColor,0,0);
            drawLine(joinVertex.x,joinVertex.y,joinVertex.x,joinVertex.y-patchingDistance,
                laneWidth*joinVertex.joinRoad[i].lanes-line_Width,roadColor,0,0);
            drawLine(joinVertex.x,joinVertex.y,joinVertex.x,joinVertex.y+patchingDistance,
                laneWidth*joinVertex.joinRoad[i].lanes-line_Width,roadColor,0,0);       
            
            ctx.translate( joinVertex.x, joinVertex.y);
            ctx.rotate((-joinVertex.joinRoad[i].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
            ctx.translate(-joinVertex.x, -joinVertex.y);  
        }
        
        ctx.translate( joinVertex.x, joinVertex.y);
        ctx.rotate((joinVertex.joinRoad[i].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
        ctx.translate(-joinVertex.x, -joinVertex.y);

        drawLine(joinVertex.x,joinVertex.y,joinVertex.x,joinVertex.y+deletionDistance,
            laneWidth*joinVertex.joinRoad[i].lanes,whiteLineColor,0,0);
        
        ctx.translate( joinVertex.x, joinVertex.y);
        ctx.rotate((-joinVertex.joinRoad[i].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
        ctx.translate(-joinVertex.x, -joinVertex.y);  
    }


    for(let i in joinVertex.joinRoad){   
        ctx.translate( joinVertex.x, joinVertex.y);
        ctx.rotate((joinVertex.joinRoad[i].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
        ctx.translate(-joinVertex.x, -joinVertex.y);

        drawLine(joinVertex.x,joinVertex.y,joinVertex.x,joinVertex.y+deletionDistance-line_Width,
            laneWidth*joinVertex.joinRoad[i].lanes-line_Width,roadColor,0,0);
        
        ctx.translate( joinVertex.x, joinVertex.y);
        ctx.rotate((-joinVertex.joinRoad[i].dir+Number(180))*Math.PI/180); //starts from bottom left vertex CCW
        ctx.translate(-joinVertex.x, -joinVertex.y);  
        
    }
}

function getIntersectionPoints(){
    intersections=[];
    
    for(let i in roadJoinsArray){
        if(roadJoinsArray[i].joinType=="intersection"){
            intersections.push(new Intersection(roadJoinsArray[i].x,roadJoinsArray[i].y,
            roadJoinsArray[i].joinRoad,roadJoinsArray[i].stopLineDistanceFromCenter));
        }
    }
}

function getTransitionPoints(){
    transitions=[];
    for(let i in roadJoinsArray){
        if(roadJoinsArray[i].joinType=="transition"){
            transitions.push(new Transition(roadJoinsArray[i].x,roadJoinsArray[i].y,
            roadJoinsArray[i].joinRoad));
        }
    }
}

function getRoadBendPoints(){
    roadBends=[];
    for(let i in roadJoinsArray){
        if(roadJoinsArray[i].joinType=="road bend"){
            roadBends.push(new RoadBend(roadJoinsArray[i].x,roadJoinsArray[i].y,
            roadJoinsArray[i].joinRoad,curveRadius,roadJoinsArray[i].bendCentroid));
        }
    }
}

function getStraightConnectionPoints(){
    straightConnections=[];
    for(let i in roadJoinsArray){
        if(roadJoinsArray[i].joinType=="straight connection"){
            straightConnections.push(new Transition(roadJoinsArray[i].x,roadJoinsArray[i].y,
            roadJoinsArray[i].joinRoad));
        }
    }
}

function drawTransition(joinVertex){
    let canvasRotation, narrowerRoad, widerRoad;
    
    if(joinVertex.joinRoad[0].lanes<joinVertex.joinRoad[1].lanes){
        narrowerRoad=joinVertex.joinRoad[0];
        widerRoad=joinVertex.joinRoad[1];
    } 
    else {
        narrowerRoad=joinVertex.joinRoad[1];
        widerRoad=joinVertex.joinRoad[0];
    }
    
    canvasRotation=narrowerRoad.dir;
    console.log("road rotation is "+canvasRotation);
    ctx.translate( joinVertex.x, joinVertex.y);
    ctx.rotate(canvasRotation* Math.PI / 180); //starts from bottom left vertex CCW
    ctx.translate(-joinVertex.x,-joinVertex.y);
    ctx.beginPath();
    ctx.moveTo(joinVertex.x-widerRoad.lanes/2*laneWidth,joinVertex.y);
    ctx.lineTo(joinVertex.x+widerRoad.lanes/2*laneWidth,joinVertex.y);
    ctx.lineTo(joinVertex.x+narrowerRoad.lanes/2*laneWidth,joinVertex.y-straightTransitionTaperLength);
    ctx.lineTo(joinVertex.x-narrowerRoad.lanes/2*laneWidth,joinVertex.y-straightTransitionTaperLength);
    ctx.closePath();
    ctx.fillStyle = roadColor;
    ctx.fill();
    
    
    drawLine(joinVertex.x-widerRoad.lanes/2*laneWidth,joinVertex.y,
        joinVertex.x-narrowerRoad.lanes/2*laneWidth,joinVertex.y-straightTransitionTaperLength,
        line_Width,whiteLineColor,0,0);
    
    drawLine(joinVertex.x+widerRoad.lanes/2*laneWidth,joinVertex.y,
        joinVertex.x+narrowerRoad.lanes/2*laneWidth,joinVertex.y-straightTransitionTaperLength,
        line_Width,whiteLineColor,0,0);

    drawLine(joinVertex.x,joinVertex.y,joinVertex.x,joinVertex.y-straightTransitionTaperLength,
        line_Width,yellowLineColor,0,0);

    drawLine(joinVertex.x-narrowerRoad.lanes/2*laneWidth,joinVertex.y,
        joinVertex.x-narrowerRoad.lanes/2*laneWidth,joinVertex.y-straightTransitionTaperLength,
        line_Width*1.3,whiteLineColor,8,15);

    drawLine(joinVertex.x+narrowerRoad.lanes/2*laneWidth,joinVertex.y,
        joinVertex.x+narrowerRoad.lanes/2*laneWidth,joinVertex.y-straightTransitionTaperLength,
        line_Width*1.3,whiteLineColor,8,15); 
    
    ctx.translate( joinVertex.x, joinVertex.y);
    ctx.rotate(-canvasRotation* Math.PI / 180); //starts from bottom left vertex CCW
    ctx.translate(-joinVertex.x,-joinVertex.y);
        
}
