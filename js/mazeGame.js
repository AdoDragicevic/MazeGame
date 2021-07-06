(function(global) {

    const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

    //Values used only at maze creation, no need to store them on each MazeGame instance
    let numOfVerticalCells, numOfHorizontalCells,
        cellHeight, cellWidth,
        grid, 
        verticalWalls, horizontalWalls;

    const generateEngine = function() {
        return Engine.create();
    };

    const setGravity = function(world ,bool) {
        world.gravity.y = bool ? 1 : 0;
    };

    const generateWorld = function(location, engine) {
        const render = Render.create({
            element: location,
            engine: engine,
            options: {
                wireframes: false,
                width: location.clientWidth,
                height: location.clientHeight,
                background: "#111A2C"
            }
        });
        return render;
    };

    const generateBorders = function(location, world) {
        const width = location.clientWidth;
        const height = location.clientHeight;
        const borders = [
            Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
            Bodies.rectangle(width/ 2, height, width, 2, { isStatic: true }),
            Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
            Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
        ];
        World.add(world, borders);
    };

    const shuffle = (arr) => {
        let counter = arr.length;
        while (counter > 0) {
            const index = Math.floor(Math.random() * counter);
            counter--;
            const temp = arr[counter];
            arr[counter] = arr[index];
            arr[index] = temp;
        }
        return arr;
    };

    //assemble list of neighbour cells (right, left, top, bottom)
    const getNeigbourCells = function(row, column) {
        return [
            [row - 1, column, "up"],
            [row, column + 1, "right"],
            [row + 1, column, "down"],
            [row, column - 1, "left"]
        ];
    };

    const processEachCell = (row, column) => {
        
        //check if cell was already processed
        if (grid[row][column]) return;
        grid[row][column] = true;

        const neighbours = getNeigbourCells(row, column);
    
        for (let neighbour of shuffle(neighbours)) {
            const [nextRow, nextColumn, direction] = neighbour;
            //see if neighbour is out of bonds
            if (nextRow < 0 || nextRow >= numOfVerticalCells || nextColumn < 0 || nextColumn >= numOfHorizontalCells) {
                //continue the for loop, but skipp current iteration
                continue;            
            }
            //if we have visited that neighbour, continue to next neighbour
            if (grid[nextRow][nextColumn]) continue;
    
            //remove wall from horizontalWalls or verticalWalls
            if (direction === "left") verticalWalls[row][column - 1] = true;
            else if (direction === "right") verticalWalls[row][column] = true;
            else if (direction === "up") horizontalWalls[row - 1][column] = true;
            else if (direction === "down") horizontalWalls[row][column] = true;
    
            //Recursion; Visit next cell
            processEachCell(nextRow, nextColumn);
        };
    
    };

    const generateHorizntalWalls = function(world, horizontalWalls) {
        horizontalWalls.forEach( (row, rowIndex) => {
            row.forEach( (open, columnIndex) => {
                if (open) return;
                const wall = Bodies.rectangle(
                    columnIndex * cellWidth + cellWidth / 2,
                    rowIndex * cellHeight + cellHeight,
                    cellWidth,
                    3,
                    {
                        label: "wall",      
                        isStatic: true,
                        render: {
                            fillStyle: "#8A4FFF"
                        }
                    }
                );
            World.add(world, wall);
            });
        });
    };

    const generateVerticalWalls = function(world, verticalWalls) {
        verticalWalls.forEach( (row, rowIndex) => {
            row.forEach( (open, columnIndex) => {
                if (open) return;
                const wall = Bodies.rectangle(
                    columnIndex * cellWidth + cellWidth,
                    rowIndex * cellHeight + cellHeight / 2,
                    3,
                    cellHeight,
                    {
                        label: "wall",
                        isStatic: true,
                        render: {
                            fillStyle: "#8A4FFF"
                        }
                    }
                );
                World.add(world, wall);
            });
        });
    };

    const generateMaze = function(world) {
        //Data on each maze cell & wall
        grid = Array(numOfVerticalCells).fill(null).map( () => Array(numOfHorizontalCells).fill(false) );
        verticalWalls = Array(numOfVerticalCells).fill(null).map( () => Array(numOfHorizontalCells -1).fill(false) );
        horizontalWalls = Array(numOfVerticalCells - 1).fill(null).map( () => Array(numOfHorizontalCells).fill(false) );

        //Generate random walls
        const startRow = Math.floor(Math.random() * numOfVerticalCells);
        const startColumn = Math.floor(Math.random() * numOfHorizontalCells);  
        processEachCell(startRow, startColumn);
        generateHorizntalWalls(world, horizontalWalls);
        generateVerticalWalls(world, verticalWalls);
    };

    const generateStartObject = function(world) {
        const ballRadius = Math.min(cellWidth, cellHeight) / 4;
        const ball = Bodies.circle(
            cellWidth / 2,
            cellHeight / 2,
            ballRadius,
            {
                label: "ball",
                render: {
                    fillStyle: "orange"
                }
            }
        );
        World.add(world, ball);
        return ball;
    };

    const generateGoal = function(location, world) {
        const goal = Bodies.rectangle(
            location.clientWidth - cellWidth / 2,
            location.clientHeight - cellHeight / 2,
            cellWidth * .7,
            cellHeight * .7,
            {
                isStatic: true,
                label: "goal",
                render: {
                    fillStyle: "#0B6E4F"
                }
            }
        );
        World.add(world, goal);
    };

    const getNumOfCells = function(direction, location, difficulty) {
        let locationSize = direction === "horizontal" ? location.clientWidth : location.clientHeight;
        let numOfCells = removeLastTwoDigits(locationSize) + 1;
        return Math.floor(numOfCells * difficulty);
    };

    const removeLastTwoDigits = function(number) {
        let num = number.toString();
        return Number(num.substring(0, num.length - 2));
    };

    const makeMovable = function(item, keys) {
        const {x, y} = item.velocity;
        const { up, right, down, left } = keys;
        document.addEventListener( "keydown", event => {
            if (event.key === up) Body.setVelocity(item, {x, y: -4});
            else if (event.key === right) Body.setVelocity(item, {x: 4, y});
            else if (event.key === down) Body.setVelocity(item, {x, y: 4});
            else if (event.key === left) Body.setVelocity(item, {x: -4, y});
        });
        document.addEventListener( "keyup", event => {
            if (event.key === up) Body.setVelocity(item, {x, y: -.2});
            else if (event.key === right) Body.setVelocity(item, {x: .2, y});
            else if (event.key === down) Body.setVelocity(item, {x, y: .2});
            else if (event.key === left) Body.setVelocity(item, {x: -.2, y});
        });
    };

    const addWinCondition = function(engine, world, playerName, startTime) {
        Events.on(engine, "collisionStart", event => {
            event.pairs.forEach( (collision) => {
                const lables = ["ball", "goal"];
                if (lables.includes(collision.bodyA.label) && lables.includes(collision.bodyB.label)) {
                    runOnWin(world, playerName, startTime);
                }
            });
        });
    };

    const runOnWin = function(world, playerName, startTime) {
        world.bodies.forEach ( body => {
            if (body.label === "wall") Body.setStatic(body, false);
        });
        setGravity(world, true);
        displayWinMessage(playerName, startTime);
    };

    const displayWinMessage = (playerName, startTime) => {
        const menu = document.querySelector(".menu");
        const title = document.querySelector(".menu__title");
        const time = document.querySelector(".menu__time");
        if(!menu || !title || !time || !menu.classList.contains("display-none")) return;
        menu.classList.remove("display-none");
        time.classList.remove("display-none");
        title.innerText = playerName ? `${playerName} wins!` : "You win!";
        time.innerHTML = `
            <p>Completion time:</p>
            <h2>${getCompletionTime(startTime)}</h2>
            <p>Can you do better?</p>
        `;
    };

    const getCompletionTime = (start) => {
        let end = new Date().getTime();
        let diff = end - start;
        return millisToMinutesAndSeconds(diff);
    };

    const millisToMinutesAndSeconds = (millis) => {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${(seconds < 10 ? "0" : "")}${seconds}`;
    };

    const updateData = (location, difficulty) => {
        numOfVerticalCells = getNumOfCells("vertical", location, difficulty);
        numOfHorizontalCells = getNumOfCells("horizontal", location, difficulty);
        cellHeight = location.clientHeight / numOfVerticalCells;
        cellWidth = location.clientWidth / numOfHorizontalCells;
    };

    const displayControls = (location, keys) => {
        if(location.querySelector(".legend")) return;
        let legend = document.createElement("div");
        legend.classList.add("legend");
        legend.innerHTML = getLegendStr(keys);
        this.legend = legend;
        location.appendChild(legend);
    };

    const getLegendStr = (keys) => {
        let { up, right, down, left } = keys;
        if(up === "ArrowUp") up = "&#8593;";
        if(right === "ArrowRight") right = "&#8594;";
        if(down === "ArrowDown") down = "&#8595;";
        if(left === "ArrowLeft") left = "&#8592;";
        return `
            <span class="legend__key legend__key--up">${up}</span>
            <span class="legend__key legend__key--right">${right}</span>
            <span class="legend__key legend__key--down">${down}</span>
            <span class="legend__key legend__key--left">${left}</span>
        `;
    };
    

    // Use to create new maze game
    function MazeGame(location, difficulty = 1, playerName = null, keys = { up: "ArrowUp", right: "ArrowRight", down: "ArrowDown", left: "ArrowLeft" } ) {
        
        this.location = location;
        this.difficulty = difficulty;
        this.playerName = playerName;
        this.keys = keys;

    };

    MazeGame.prototype = {
        
        setDifficulty(num) {
            this.difficulty = num;
            //Make methods chainable by returning "this"
            return this;
        },

        setKeys(newKeys) {
            this.keys = newKeys;
            return this;
        },

        clear() {
            World.clear(this.world);
            Engine.clear(this.engine);
            Render.stop(this.render);
            if(this.render.canvas) this.render.canvas.remove();
            this.render.canvas = null;
            this.render.context = null;
            this.render.textures = {};
            return this;
        },
        
        init() {
            this.engine = generateEngine();
            this.render = generateWorld(this.location, this.engine);
            this.world = this.engine.world;
            Render.run(this.render);
            Runner.run(Runner.create(), this.engine);
            updateData(this.location, this.difficulty);  
            setGravity(this.world, false);
            generateBorders(this.location, this.world);
            generateMaze(this.world);
            this.ball = generateStartObject(this.world);
            makeMovable(this.ball, this.keys);
            displayControls(this.location, this.keys);
            generateGoal(this.location, this.world);
            addWinCondition(this.engine, this.world, this.playerName, new Date().getTime());
        }

    };


    global.MazeGame = MazeGame;

    
})(window);