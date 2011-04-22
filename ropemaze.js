$(function() {  
  var maze = {
    'outside':{
      'door_out_nw':{to:{room:'room_nw',door:'door_nw_n'},display:$('#door_nw_n')},
      'door_out_ne':{to:{room:'room_ne',door:'door_ne_n'},display:$('#door_ne_n')},
      'door_out_en':{to:{room:'room_ne',door:'door_ne_e'},display:$('#door_ne_e')},
      'door_out_es':{to:{room:'room_se',door:'door_se_e'},display:$('#door_se_e')},
      'door_out_se':{to:{room:'room_se',door:'door_se_s'},display:$('#door_se_s')},
      'door_out_s' :{to:{room:'room_s' ,door:'door_s_s'}, display:$('#door_s_s')},
      'door_out_sw':{to:{room:'room_sw',door:'door_sw_s'},display:$('#door_sw_s')},
      'door_out_ws':{to:{room:'room_sw',door:'door_sw_w'},display:$('#door_sw_w')},
      'door_out_wn':{to:{room:'room_nw',door:'door_nw_w'},display:$('#door_nw_w')}
    },
    'room_nw':{
      'door_nw_n':{to:{room:'outside',door:'door_out_nw'},display:$('#door_nw_n')},
      'door_nw_e':{to:{room:'room_ne',door:'door_ne_w'},display:$('#door_nw_e')},
      'door_nw_s':{to:{room:'room_sw',door:'door_sw_n'},display:$('#door_nw_s')},
      'door_nw_w':{to:{room:'outside',door:'door_out_wn'},display:$('#door_nw_w')}
    },
    'room_ne':{
      'door_ne_n':{to:{room:'outside',door:'door_out_ne'},display:$('#door_ne_n')},
      'door_ne_e':{to:{room:'outside',door:'door_out_en'},display:$('#door_ne_e')},
      'door_ne_se':{to:{room:'room_se',door:'door_se_n'},display:$('#door_ne_se')},
      'door_ne_sw':{to:{room:'room_s',door:'door_s_ne'},display:$('#door_ne_sw')},
      'door_ne_w':{to:{room:'room_nw',door:'door_nw_e'},display:$('#door_nw_e')}
    },
    'room_se':{
      'door_se_n':{to:{room:'room_ne',door:'door_ne_se'},display:$('#door_ne_se')},
      'door_se_e':{to:{room:'outside',door:'door_out_es'},display:$('#door_se_e')},
      'door_se_s':{to:{room:'outside',door:'door_out_se'},display:$('#door_se_s')},
      'door_se_w':{to:{room:'room_s',door:'door_s_e'},display:$('#door_se_w')}
    },
    'room_s':{
      'door_s_n':{to:{room:'room_ne',door:'door_ne_sw'},display:$('#door_ne_sw')},
      'door_s_e':{to:{room:'room_se',door:'door_se_w'},display:$('#door_se_w')},
      'door_s_s':{to:{room:'outside',door:'door_out_s'},display:$('#door_s_s')},
      'door_s_w':{to:{room:'room_sw',door:'door_sw_e'},display:$('#door_sw_e')}
    },
    'room_sw':{
      'door_sw_n':{to:{room:'room_nw',door:'door_nw_sw'},display:$('#door_nw_s')},
      'door_sw_e':{to:{room:'room_s', door:'door_s_w'},display:$('#door_sw_e')},
      'door_sw_s':{to:{room:'outside',door:'door_out_sw'},display:$('#door_sw_s')},
      'door_sw_w':{to:{room:'outside',door:'door_out_ws'},display:$('#door_sw_w')}
    }
  };

  var count = $("#count");
  var tries = $("#tries");
  var crosses = {};
  
  // Get an indexed array of all the doors.
  var doors = {};
  for(var roomName in maze ) {
    doors[roomName] = [];
    var room = maze[roomName];
    for( var doorName in room ) {
      doors[roomName].push(doorName);
    }
  }

  // Build a collision map.
  for( var roomName in maze ) {
    var num_doors = doors[roomName].length;
    var i=0;
    for(i=0; i<num_doors; i++) {
      var iDoor = doors[roomName][i];
      var j=0;
      for(j=i+2; j<num_doors; j++) {
        var jDoor = doors[roomName][j];
        var k=0;
        crosses[iDoor + ":" + jDoor] = {};
        for(k=i+1; k<j; k++) {
          var kDoor = doors[roomName][k];
          var l=0;
          for(l=j+1; l<num_doors; l++) {
            var lDoor = doors[roomName][l];
            crosses[iDoor + ":" + jDoor][kDoor + ":" + lDoor] = true;
          }
        }
      }
    }
  }

  var rooms = [];
  rooms[0] = {
    fromDoor:'',
    toDoor:'',
    room:'outside',
    tried:{}
  };

  // Checks to see if this path crosses with any prevoious path.
  function doesCross( fromDoor, toDoor ) {
    var path1 = fromDoor + ":" + toDoor;
    var path2 = toDoor + ":" + fromDoor;
    var retVal = false;
    for( var step in rooms ) {
      var room = rooms[step];
      var temp1 = room.fromDoor + ":" + room.toDoor;
      var temp2 = room.toDoor + ":" + room.fromDoor;
      if( (crosses[path1] && crosses[path1][temp1]) ||
        (crosses[path2] && crosses[path2][temp1]) ||
        (crosses[path1] && crosses[path1][temp2]) ||
        (crosses[path2] && crosses[path2][temp2]) ||
        (crosses[temp1] && crosses[temp1][path1]) ||
        (crosses[temp2] && crosses[temp2][path1]) ||
        (crosses[temp1] && crosses[temp1][path2]) ||
        (crosses[temp2] && crosses[temp2][path2]) ) {
        retVal = true;
        break;
      }
    }
    return retVal;
  }

  // Find a door.
  function findDoor( step ) {
    var door = null;
    if( rooms[step] && rooms[step].room ) {
      for( var toDoor in maze[rooms[step].room] ) {
        var thisDoor = maze[rooms[step].room][toDoor];
        if( thisDoor &&
            !thisDoor.display.hasClass("entered") &&
            !rooms[step].tried[toDoor] &&
            !doesCross(rooms[step].fromDoor,toDoor) ) {
          door = thisDoor;
          door.display.text(step+1).removeClass('tried').addClass("entered");
          rooms[step].toDoor = toDoor;
          break;
        }
      }
    }
    return door;
  }

  var step = 0;
  var numTries = 0;
  var running = false;

  // Step our maze forward one step.
  function stepForward() {
    var door = findDoor(step);
    if( door ) {
      // Enter this door.
      step++;
      rooms[step] = {};
      rooms[step].tried = {};
      rooms[step].door = door;
      rooms[step].fromDoor = door.to.door;
      rooms[step].room = door.to.room;
      tries.text(++numTries);
    }
    else {
      // Step back and try again...
      rooms[step].tried = {};
      rooms[step].door.display.text('').removeClass("entered").addClass('tried');
      step--;
      rooms[step].tried[rooms[step].toDoor] = true;
    }
  }

  $('#nextstep').click(function() {
    stepForward();
  });

  $('#run').click(function() {
    running = true;
  	(function() {
  	  if( running ) {
  	    stepForward();
  	    var doorCount = $("div.door.entered").length;
		count.text(doorCount);
		if( doorCount != 15 ) {
  	      setTimeout( arguments.callee, 1 );
  	   	}
  	  }
  	})();
  });
  
  $('#stop').click(function() {
  	running = false;
  });

});