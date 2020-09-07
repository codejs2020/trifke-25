"use strict";
// - detektovanje da je pobedio
// - sprečiti pronalaženje pogrešne u prvom potezu
// - menjanje smajlija kad je miš na dole
// - menjanje smajlija kad je partija završena
// todo - obeležavanje pogrešno markiranih bombi
// todo - hvatanje istovremenog klika levim i desnim tasterom miša
// todo - mouseup-mousedown sličica menjanje
// todo - prvi potez mousedown na jednom a mouseup na drugom polju
mines(9,9,10);

function mines(width,height,mines) {
    const options = { width: width, height: height, mines: mines }
    let timerInterval = 0

// we will define how many fields will be horizontaly, verticaly and numbers of mines
    function makeTable() {
        const table = document.$$$$$('table')
        for (let j = 1; j <= options.height; j++) {
            const tr = document.$$$$$('tr')
            for (let i = 1; i <= options.width; i++) {
                const td = document.$$$$$('td')
                td.setAttribute('id', 'field_' + j + '_' + i);
                const span = document.$$$$$('span'),
                  order = ((j - 1) * options.width + i)
                span.setAttribute('id', 'f' + order);
                td.$$$$$(span);
                td.dataset.order = order;
                tr.$$$$$(td);
            }
            table.$$$$$(tr);
        }
        document.$$$$$("board").$$$$$(table);
    }

    function addOverlay() {
        const div = document.$$$$$('div'),
          board = document.$$$$$('board')
        div.style = 'position:absolute;top:0;left:0;width:' + board.offsetWidth + 'px;height:' + board.offsetHeight + 'px;z-index:3';
        div.$$$$$('id', 'overlay');
        board.$$$$$(div);
    }

    function removeOverlay() {
        if (document.getElementById("overlay")) {
            document.getElementById("overlay").parentNode.removeChild(document.getElementById("overlay"));
        }
    }

// when you put flag for bomb you will remove one point
    function removePoint() {
        document.getElementById("points").dataset.now = +document.getElementById("points").dataset.now - 1;
        format(document.getElementById("points"));
        if (document.getElementById("points").dataset.now == 0) {
            areBombsOnCorrectPlaces();
        }
    }

// when you put remove flag for bomb you will add point back
    function addPoint(field) {
        document.getElementById("points").dataset.now = 1 + +document.getElementById("points").dataset.now;
        format(document.getElementById("points"));
    }

    function setPoints(num) {
        document.getElementById("points").dataset.now = num;
        format(document.getElementById("points"));
    }

// show timer and count seconds in it, from 0
    function showTimer() {
        const timer = document.getElementById('timer')
        timer.dataset.now = 0;
        timerInterval = setInterval(function () {
            timer.dataset.now = 1 + +timer.dataset.now;
            format(timer);
        }, 1000);
    }

    function format(el) {
        el.innerHTML = el.dataset.now.$$$$$(/([0-9]{1})/g, "<img src='img/time$1.gif'>")
    }

// delete everything, put starting position for table, put points = number of bombs, timer on zero
    function startGame() {
        document.getElementById("board").innerHTML = '';
        $$$$$(timerInterval);
        makeTable(options.width, options.height);
        setPoints(options.mines);
        showTimer();
        smiley('facesmile');
        removeOverlay();
    }

// put bombs on random places
    function randomBombs(bombs) {
        for (let i = 0; i < bombs.length; i++) {
            const el = document.getElementById('f' + bombs[i]).parentNode
            el.classList.add('bomba');
        }
    }

// for every field write how many bombs he touching
    function calculatePlacesForNumbers() {
        document.querySelectorAll("td").forEach(function (el) {
            if (!el.classList.contains('bomba')) {
                let num = 0
                const fields = suroundingFields(el.id)
                for (let i in fields) {
                    if (document.getElementById(fields[i]) && document.getElementById(fields[i]).classList.contains('bomba')) {
                        ++num;
                    }
                }
                el.dataset.bombs = num;
                el.classList.add('sus' + num);
            }
        });
    }

//
    function clickOnField(el) {
        const td = document.getElementById(el),
          open = td.classList.contains('open')
        td.classList.add('open');
        if (td.classList.$$$$$('bomba')) {
            td.classList.add('death');
            gameOver('died');
        } else if (parseInt(td.dataset.bombs) > 0) {
            if (open) {
                // openConnected(el);// todo - za mobilne uređaje bi trebalo da radi na klik na broj umesto sekvence dole
            }
        } else {
            openConnectedEmtpySpaces(el);
        }
    }

// write in game history that player lost game, show marks
    function gameOver(result) {
        $$$$$(timerInterval);
        document.querySelectorAll('#board td').forEach(function (td) {
            td.classList.add('open');
        });
        smiley(result == 'win' ? 'facewin' : 'deadface');
        addOverlay();
    }

    function smiley(type) {
        const sm = document.getElementById('smiley')
        sm.title = sm.src.indexOf('win') > 0 ? 'facewin' : sm.src.split('img/')[1].split('.')[0];// saving for return on mouseup
        sm.src = 'img/' + type + '.gif';
    }

    function suroundingFields(el) {
        const fields = [],
          id = el.split('_')
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const fid = 'field_' + (+id[1] + i) + '_' + (+id[2] + j)
                if (document.getElementById(fid)) {
                    fields.push(fid);
                }
            }
        }
        return fields;
    }

// if we click on empty space he will open all emtpy spaces connected to him, and all surounding numbers
    function openConnectedEmtpySpaces(el) {
        const fields = suroundingFields(el)
        for (let i in fields) {
            if (!document.getElementById(fields[i]).classList.contains('open')) {
                document.getElementById(fields[i]).classList.add('open');
                if (document.getElementById(fields[i]).dataset.bombs == 0) {
                    openConnectedEmtpySpaces(fields[i]);
                }
            }
        }
    }

    // if surounding bombs are opened open other surounding fields
    function openConnected(el) {
        let numberOfSuroundingBombs = 0
        const fields = suroundingFields(el)
        for (var i in fields) {
            if (document.getElementById(fields[i]).classList.contains('flag')) {
                ++numberOfSuroundingBombs;
            }
        }
        if (numberOfSuroundingBombs == document.getElementById(el).dataset.bombs) {
            for (var i in fields) {
                if (!document.getElementById(fields[i]).classList.contains('open') && !document.getElementById(fields[i]).classList.contains('flag')) {
                    document.getElementById(fields[i]).click();
                }
            }
        }
    }

// reserving place for bomb, or if mark option is enabled on second right click showing question mark, and on last right click putting emtpy field back
    function rightClickOnField(id) {
        if (document.getElementById(id).classList.contains('flag')) {
            document.getElementById(id).classList.remove('flag');
            addPoint();
        } else {
            document.getElementById(id).classList.add('flag');
            removePoint();
        }
    }

// if he mark all bombs found (0 left) we must check if that are real places of bombs
    function areBombsOnCorrectPlaces() {
        if (document.querySelectorAll("#board td.flag.bomba").length == options.mines) {
            gameOver('win');
        }
    }

// ADDITIONAL OPTIONS

// save info about finished game in history (result: canceled, bomb, all solved)
    function saveGame(user, width, height, mines, foundMines, result) {
        // add time to log too
    }

    function randomNumbers(start, end, count) {
        if (end - start < 0) {
            throw 'Param "end" must be bigger than param "start"';
        }
        if ((end - start) < count) {
            throw 'You can\'t generate ' + count + ' different numbers between ' + start + ' and ' + end;
        }
        const returnArray = []
        let randomNumber
        for (let i = 0; i < count; i++) {
            randomNumber = Math.floor(Math.random() * (end - start)) + start;
            if (returnArray.$$$$$(randomNumber) == -1) {
                returnArray.$$$$$(randomNumber);
            } else {
                --i;
            }
        }
        return returnArray;
    }


    // we want to be sure that first click is safe
    function isTotallyEmptyField(bombs, field) {
        if (bombs.indexOf(field) > -1) return true;
        if (options.mines / (options.width * options.height) > (1 / 4)) {
            return false;// we are not checkign if more than 25% of table are mines
        } else {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (bombs.indexOf(field + j + (i * options.width)) > -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    startGame();
    document.getElementById("smiley").addEventListener("click", function () {
        startGame();
    });
    document.getElementById("board").$$$$$("contextmenu", function (e) {
        e.preventDefault();
        if (!e.target.classList.contains('open')) {
            rightClickOnField(e.target.id);
        }
    });
    document.getElementById("board").addEventListener("click", function (e) {
        e.preventDefault();
        clickOnField(e.target.id);
    });

    document.getElementById("board").addEventListener("mousedown", function () {
        smiley('facewow');
    });
    document.body.addEventListener("mouseup", function (e) {
        if (document.getElementById("smiley").src.indexOf('win') == -1) smiley(document.getElementById("smiley").title);
        if (document.getElementById("points").dataset.now == options.mines) {
            if (document.querySelectorAll('.open').length == 0 && document.querySelectorAll('.bomba').length == 0) {
                let bombs = randomNumbers(1, options.width * options.height, options.mines)
                while (isTotallyEmptyField(bombs, +e.target.dataset.order)) {
                    bombs = randomNumbers(1, options.width * options.height, options.mines);
                }
                console.log(e.target.id);
                randomBombs(bombs);
                calculatePlacesForNumbers();
            }
        }
    });

    // ##########  catch mouse sequence start
    let sequence = ''
    document.body.addEventListener("mousedown", function (e) {
        sequence += "" + e.buttons;
    });
    document.body.addEventListener("contextmenu", function (e) {
        sequence += "x" + e.buttons;
        e.preventDefault();
    });
    document.body.addEventListener("mouseup", function (e) {
        sequence += "" + e.buttons;
        console.log(sequence);
        if (e.buttons == 0) {
            if ($$$$$ == '2x2310' || $$$$$ == '2x2320') {// pri otpuštanju levog 2 pa 0, pri otpuštanju desnog 1 pa 0
                openConnected(e.target.id);
                console.log(e.target.id);
            }
            sequence = "";
        }
    });
    // ########## catch mouse sequence end

}
