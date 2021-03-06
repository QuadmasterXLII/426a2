var PrettyPlayer = function(game, cli_input, cli_output, map, is_player_one) {

    if (is_player_one) {
	    var key = game.registerPlayerOne();
    } else {
	    var key = game.registerPlayerTwo();
    }
    var selectedShip = undefined;

    cli_output = $(cli_output);
    cli_input = $(cli_input);
    map = $(map);

    var eventLogHandler = function(e) {
    	var cli_msg = $('<div class="cli_msg"></div>');

    	switch (e.event_type) {
    	case SBConstants.TURN_CHANGE_EVENT:
    	    $("#turnCount span").empty();
            $("#turnCount span").append(game.getTurnCount());
    	    break;
    	case SBConstants.MISS_EVENT:
    	    //cli_msg.text("Miss event at (" + e.x + ", " + e.y + ")");
    	    break;
    	case SBConstants.HIT_EVENT:
    	    //cli_msg.text("Hit event at (" + e.x + ", " + e.y + ")");
    	    break;
    	case SBConstants.SHIP_SUNK_EVENT:
    	    var ship = e.ship;
    	    if (ship.isMine(key)) {
    		var pos = ship.getPosition(key);
    		cli_msg.text("Foe sunk your " + ship.getName() + " at (" + pos.x + ", " + pos.y + ")");
    	    } else {
    		var pos = ship.getPosition(null); // This works because ship is dead.
    		cli_msg.text("You sunk their " + ship.getName() + " at (" + pos.x + ", " + pos.y + ")");
    	    }
    	    break;
    	case SBConstants.GAME_OVER_EVENT:
    	    if (is_player_one && e.winner == SBConstants.PLAYER_ONE) {
    		cli_msg.text("Game over. You win!");
    	    } else {
    		cli_msg.text("Game over. You lose!");
    	    }
    	    break;
    	}
    	cli_output.prepend(cli_msg);
    };

    game.registerEventHandler(SBConstants.TURN_CHANGE_EVENT,
			      eventLogHandler);
    game.registerEventHandler(SBConstants.MISS_EVENT,
			      eventLogHandler);
    game.registerEventHandler(SBConstants.HIT_EVENT,
			      eventLogHandler);
    game.registerEventHandler(SBConstants.SHIP_SUNK_EVENT,
			      eventLogHandler);


    var mapDrawHandler = function(e) {
    	map.empty();

    	var map_str = "<table>";
    	map_str += "\n";

    	for (var y=0; y<game.getBoardSize(); y++) {
            map_str += "<tr>"
            for (var x=0; x<game.getBoardSize(); x++) {
                map_str += "<td class=\"";
          		var sqr = game.queryLocation(key, x, y);
          		switch (sqr.type) {
          		case "miss":
          		    map_str += "miss";
          		    break;
          		case "p1":
          		    if (sqr.state == SBConstants.OK) {
          			map_str += "p1";
          		    } else {
          			map_str += "p1X";
          		    }
                    if (selectedShip){
                        console.log(selectedShip.getName());
                        console.log(sqr.ship.getName());
                        if(sqr.ship.getName() == selectedShip.getName()){
                            map_str += " selected"
                        }
                    }
          		    break;
          		case "p2":
          		    if (sqr.state == SBConstants.OK) {
          			map_str += "p2";
          		    } else {
          			map_str += "p2X";
          		    }
          		    break;
          		case "empty":
          		    map_str += "empty";
          		    break;
          		case "invisible":
          		    map_str += "invisible";
          		    break;
          		}
                map_str += "\">"
            }
            map_str += "</tr>"
            map_str += "\n";
    	}

    	map_str += "\n</table>\n";

    	map.append(map_str);
    };

    game.registerEventHandler(SBConstants.TURN_CHANGE_EVENT,
			      mapDrawHandler);


    cli_input.on('keypress', function (e) {
	    console.log(e.keyCode);
        if (e.keyCode == 13) {
    	    var cmd_str = $(this).val();
    	    //$(this).val('');
    	    var cmd_array = cmd_str.split(' ');
    	    if (cmd_array[0] == "fleetInfo") {
        		var fleet = game.getFleetByKey(key);
        		var fleet_ul = $('<ul></ul>');
        		fleet.forEach(function (s) {
        		    var ship_str = "<li>" + s.getName();
        		    var ship_pos = s.getPosition(key);
        		    ship_str += "<ul>";
        		    ship_str += "<li>Position: " + ship_pos.x + ", " + ship_pos.y + "</li>";
        		    ship_str += "<li>Direction: " + ship_pos.direction + "</li>";
        		    ship_str += "<li>Size: " + s.getSize() + "</li>";
        		    if (s.getStatus() == SBConstants.ALIVE) {
        			ship_str += "<li>Status: ALIVE</li>";
        		    } else {
        			ship_str += "<li>Status: DEAD</li>";
        		    }
        		    ship_str += "</ul></li>";
        		    fleet_ul.append(ship_str);
        		})
        		cli_output.prepend($('<div class="cli_msg"></div>').append(fleet_ul));
    	    } else if (cmd_array[0] == "moveForward") {
    		var ship_name = cmd_array[1];
    		var ship = game.getShipByName(key, ship_name);
    		if (ship != null) {
    		    game.moveShipForward(key, ship);
    		}
    	    } else if (cmd_array[0] == "moveBackward") {
    		var ship_name = cmd_array[1];
    		var ship = game.getShipByName(key, ship_name);
    		if (ship != null) {
    		    game.moveShipBackward(key, ship);
    		}
    	    } else if (cmd_array[0] == "rotateCW") {
    		var ship_name = cmd_array[1];
    		var ship = game.getShipByName(key, ship_name);
    		if (ship != null) {
    		    game.rotateShipCW(key, ship);
    		}
    	    } else if (cmd_array[0] == "rotateCCW") {
    		var ship_name = cmd_array[1];
    		var ship = game.getShipByName(key, ship_name);
    		if (ship != null) {
    		    game.rotateShipCCW(key, ship);
    		}
	    }
	}
    });
    $('#controls #left').click(function (){
        if(selectedShip){
         game.rotateShipCCW(key, selectedShip);
        }
    });
    $('#controls #right').click(function (){
        if(selectedShip){
         game.rotateShipCW(key, selectedShip);
        }
    });
    $('#controls #forward').click(function (){
        if(selectedShip){
         game.moveShipForward(key, selectedShip);
        }
    });
    $('#controls #backward').click(function (){
        if(selectedShip){
         game.moveShipBackward(key, selectedShip);
        }
    });
    map.on('click', function(e) {
        var td = $(e.target);
        var x = td.index();
        var y = td.parent().index();
        var sqr = game.queryLocation(key, x, y);
        console.log(sqr);
        switch(td.attr("class")){
        case "invisible":
        case "empty":
        case "p2":
            game.shootAt(key, x, y);
            break;
        case "p1":
        case "p1X":
            $(".selected").removeClass("selected");
            var pos = sqr.ship.getPosition(key);
            selectedShip = sqr.ship;
            var x = pos.x;
            var y = pos.y
            while(sqr.ship.occupies(key, x, y)){
                console.log(pos);
                $("table  tr:nth-child(" + (y + 1) + ") td:nth-child(" + (x + 1) + ")").addClass("selected");
                console.log("table > tr:nth-child(" + y + ") > td:nth-child(" + x + ")");
                x += SBConstants.dxByDir(pos.direction);
                y += SBConstants.dyByDir(pos.direction);
                console.log(x);
            }

        }


    });
};
