(function(menu, mazelocations, MazeGame, keys) {

    const mazes = [];
    let numOfPlayers = 1;
    let difficultyLvl = 1;

    (function generateMazes() {
        mazelocations.forEach( (location, i) => {
            const game = new MazeGame(location, difficultyLvl, `Player ${i+1}`, keys[i]);
            game.init(); 
            mazes.push(game);
        });
    })();

    (function renderMenu() {
        menu.innerHTML = `
            <h1 class="menu__title">Maze Game</h1>        
            <div class="menu__content">
                <div class="menu__difficulty display-none">
                    <button class="btn btn--1 btn--clicked">I like my life easy</button>
                    <button class="btn btn--1">I want a challenge!</button>
                    <button class="btn btn--1">I hate myself</button>
                </div>
                <div class="menu__player display-none">
                    <button class="btn btn--1 btn--clicked">Single Player</button>
                    <button class="btn btn--1">Multyplayer</button>
                </div>
                <div class="menu__welcome ">
                    <p class="menu__txt">Finish the maze in</p> 
                    <p class="menu__txt">record time</p>
                    <p class="menu__txt">or</p>
                    <p class="menu__txt">play against</p>
                    <p class="menu__txt">friends!</p>
                </div>
                <div class="menu__time display-none">
                </div>
            </div>
            <div class="menu__options">
                <button class="btn btn--2 btn--players">Players</button>
                <button class="btn btn--2 btn--difficulty">Difficulty</button>
                <button class="btn btn--2 btn--start">Start</button>
            </div>
        `;
    })();

    (function addEvents() {

        //buttons
        const exitBtn = document.querySelector(".btn--exit");
        const startBtn = menu.querySelector(".btn--start");
        const setPlayers = menu.querySelector(".btn--players");
        const setDifficulty = menu.querySelector(".btn--difficulty");
        const difficultyOptions = menu.querySelectorAll(".menu__difficulty button");
        const playerOptions = menu.querySelectorAll(".menu__player button");

        //dynamic content
        const title = menu.querySelector(".menu__title");
        const contents = menu.querySelectorAll(".menu__content div");
        const difficulty = menu.querySelector(".menu__difficulty");
        const players = menu.querySelector(".menu__player");
        const welcome = menu.querySelector(".menu__welcome");

        exitBtn.addEventListener( "click", () => {
            menu.classList.remove("display-none");
            title.innerText = "Maze Game";
            exitBtn.classList.add("display-none");
            contents.forEach( div => div.classList.add("display-none") );
            welcome.classList.remove("display-none");
            mazes.forEach( maze => maze.clear() );
        });

        setPlayers.addEventListener( "click", () => {
            title.innerText = "Payers";
            contents.forEach( div => div.classList.add("display-none") );
            players.classList.remove("display-none");
        });

        setDifficulty.addEventListener( "click", () => {
            title.innerText = "Difficulty";
            contents.forEach( div => div.classList.add("display-none") );
            difficulty.classList.remove("display-none");
        });

        startBtn.addEventListener( "click", () => {
            menu.classList.add("display-none");
            exitBtn.classList.remove("display-none");
            contents.forEach( div => div.classList.add("display-none") );
            mazes[0].playerName = numOfPlayers === 1 ? null : "Player 1";
            mazelocations.forEach( (location, i) => {
                if(i < numOfPlayers) {
                    location.classList.remove("display-none");
                } 
                else location.classList.add("display-none");
            });
            mazes.forEach( (maze, i) => {
                if (i < numOfPlayers) {
                    maze.location = mazelocations[i];
                    maze.clear().setDifficulty(difficultyLvl).init();
                } else maze.clear();
            });
        });

        playerOptions.forEach( (option, i) => {
            option.addEventListener( "click", () => {
                playerOptions.forEach( opt => opt.classList.remove("btn--clicked") );
                playerOptions[i].classList.add("btn--clicked");
                numOfPlayers = i + 1;
            });
        });

        difficultyOptions.forEach( (option, i) => {
            option.addEventListener( "click", () => {
                difficultyOptions.forEach( opt => opt.classList.remove("btn--clicked") );
                difficultyOptions[i].classList.add("btn--clicked");
                difficultyLvl = i + 1;
            });
        });
    })();

})(
    document.querySelector(".menu"),
    document.querySelectorAll(".maze__location"),
    MazeGame, 
    [
        { up: "w" , right: "d", down: "s", left: "a" },
        { up: "ArrowUp", right: "ArrowRight", down: "ArrowDown", left: "ArrowLeft" }
    ]
);