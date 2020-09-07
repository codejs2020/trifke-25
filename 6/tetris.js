const Tetris = function (initialConfig) {
  const config = {
    boardWidth: 10,
    boardHeight: 14,
    initialSpeed: 2500,
    speedIncreasePerLevel: 200,
    pointsForLevelingUp: 1,
    // **** **** **** ****
    shapes: [ // rotate0, rotate90, rotate180, rotate270, skipLines * 4, color, consolePreview,name
      ['0000111100000000', '0100010001000100', '0000111100000000', '0100010001000100', 1, 0, 1, 0, 'red', '####', 'line'],
      ['0000000001100110', '0000000001100110', '0000000001100110', '0000000001100110', 2, 2, 2, 2, 'blue', '##\n##', 'box'],
      ['0000000011100010', '0000010001001100', '0000100011100000', '0000011001000100', 2, 1, 2, 1, 'yellow', '###\n  #', 'gRight'],
      ['0000000011101000', '0000110001000100', '0000001011100000', '0000010001000110', 2, 1, 2, 1, 'lime', '###\n#', 'gLeft'],
      ['0000010001100010', '0000000001101100', '0000010001100010', '0000000001101100', 1, 2, 1, 2, 'brown', '#\n##\n #', 'cRight'],
      ['0000010011001000', '0000000011000110', '0000010011001000', '0000000011000110', 1, 2, 1, 2, 'pink', ' #\n##\n#', 'cLeft'],
      ['0000000011100100', '0000010011000100', '0000010011100000', '0000010001100100', 2, 1, 2, 1, 'orange', '###\n #', 'gun']
    ]
  }

  let board = [],
    currentLevel = 1,
    distanceFromTop = 0,
    currentSpeed = config.initialSpeed,
    rotationStep = 0, //
    points = 0
  const startTime = new Date()
  let gameFinished = false,
    gamePaused = false,
    nextShape = randomShape(),
    shape = randomShape()
  const startColumn = Math.floor(config.boardWidth / 2) - 2
  let currrentStartColumn = startColumn
  const player = ''
  let dragStartPoint

  for (var i in initialConfig) {
    config[i] = initialConfig[i]// if we wan
  }

  function startGame () {
    createTable()
    moveDown()
  }

  function quitGame () {
    if (confirm('Are you sure')) {
      newGame()
    }
  }

  function newGame () {
    location.reload()
  }

  function saveGame () {
    let savedGames = localStorage.getItem('Tetris-Saved-Games')
    if (savedGames == null) {
      savedGames = '[]'
    }
    const savedGamesParsed = JSON.parse(savedGames)
    savedGamesParsed.push([player, currentLevel, points, +startTime, +new Date()])// player, level, points, startTime, endTime
    localStorage.setItem('Tetris-Saved-Games', JSON.stringify(savedGamesParsed))
  }

  function moveDown () {
    putShapeOnTable(shape, distanceFromTop)
    distanceFromTop++
    renderGame()
    if (!gameFinished && !gamePaused) setTimeout(function () {
      moveDown()
    }, currentSpeed)
  }

  function moveDownFast () {
    if (!gameFinished && !gamePaused) {
      putShapeOnTable(shape, distanceFromTop)
      distanceFromTop++
      renderGame()
    }
  }

  function gameOver () {
    console.error('gameOver')
    saveGame()
    gameFinished = true
  }

  function pauseGame () {
    gamePaused = true
  }

  function resumeGame () {
    gamePaused = false
    moveDown()
  }

  function createTable () {
    board = []
    for (let i = 0; i < config.boardHeight; i++) {
      board[i] = []
      for (let j = 0; j < config.boardWidth; j++) {
        board[i][j] = 0// 0 empty, 1 taken, 2 moving piece
      }
    }
  }

  function randomShape () {
    return config.shapes[Math.floor(Math.random() * config.shapes.length)]
  }

  function bottomReached () {
    changeFields(2, 1)
    distanceFromTop = 0
    rotationStep = 0
    shape = nextShape
    nextShape = randomShape()
    currrentStartColumn = startColumn
    detectFullLine()
  }

  function getShapeDots (rotatedShape) {
    const shapeDots = []
    rotatedShape = rotatedShape || shape[rotationStep]
    for (let i = 0; i < rotatedShape.length; i++) {
      if (rotatedShape[i] === '1') {
        const offset = shape[rotationStep + 4],
          row = Math.floor(i / 4) + distanceFromTop - offset,
          cell = parseInt(currrentStartColumn) + i % 4
        shapeDots.push({ row: row, cell: cell })
      }
    }
    return shapeDots
  }

  function putShapeOnTable (shape, distanceFromTop) {
    resetMovingFields()
    const shapeDots = getShapeDots()
    for (let dotIndex = 0; dotIndex < shapeDots.length; dotIndex++) {
      const dot = shapeDots[dotIndex]
      board[dot.row][dot.cell] = 2
    }

    if (!canIMoveDown()) {
      if (distanceFromTop == 1) {
        putLastShape()
        gameOver()
      }
      bottomReached()
    }

    return shapeDots

  }

  function putLastShape () {
    const shapeDots = getShapeDots()
    for (let dotIndex = 0; dotIndex < shapeDots.length; dotIndex++) {
      const dot = shapeDots[dotIndex]
      board[dot.row][dot.cell] = 3
    }
  }

  function canIMoveLeft () {
    const shapeDots = getShapeDots()
    for (let dotIndex = 0; dotIndex < shapeDots.length; dotIndex++) {
      const dot = shapeDots[dotIndex]
      if (typeof board[dot.row][dot.cell - 1] === 'undefined' || board[dot.row][dot.cell - 1] === 1) {
        return false
      }
    }
    return true
  }

  function canIMoveRight () {
    const shapeDots = getShapeDots()
    for (let dotIndex = 0; dotIndex < shapeDots.length; dotIndex++) {
      const dot = shapeDots[dotIndex]
      if (typeof board[dot.row][dot.cell + 1] === 'undefined' || board[dot.row][dot.cell + 1] === 1) {
        return false
      }
    }
    return true
  }

  function canIRotateRight () {
    const shapeDots = getShapeDots(shape[rotationStep + 1 == 4 ? 0 : rotationStep + 1])
    for (let dotIndex = 0; dotIndex < shapeDots.length; dotIndex++) {
      const dot = shapeDots[dotIndex]
      if (typeof board[dot.row][dot.cell] === 'undefined' || board[dot.row][dot.cell] === 1) {
        return false
      }
    }
    return true
  }

  function canIRotateLeft () {
    const shapeDots = getShapeDots(shape[rotationStep - 1 < 0 ? 3 : rotationStep - 1])
    for (let dotIndex = 0; dotIndex < shapeDots.length; dotIndex++) {
      const dot = shapeDots[dotIndex]
      if (typeof board[dot.row][dot.cell] === 'undefined' || board[dot.row][dot.cell] === 1) {
        return false
      }
    }
    return true
  }

  function canIMoveDown () {
    const shapeDots = getShapeDots()
    for (let dotIndex = 0; dotIndex < shapeDots.length; dotIndex++) {
      const dot = shapeDots[dotIndex]
      if (!(typeof board[dot.row + 1] !== 'undefined' && board[dot.row + 1][dot.cell] !== 1)) {
        return false
      }
    }
    return true
  }

  function resetMovingFields () {
    changeFields(2, 0)
  }

  function changeFields (from, to) {
    for (let i = 0; i < config.boardHeight; i++) {
      for (let j = 0; j < config.boardWidth; j++) {
        if (board[i][j] == from) {
          board[i][j] = to
        }
      }
    }
  }

  function detectFullLine () {
    let sum
    const linesToRemove = []
    for (let row = 0; row < config.boardHeight; row++) {
      sum = 0
      for (let column = 0; column < config.boardWidth; column++) {
        sum += board[row][column] == 1 ? 1 : 0
      }
      if (sum == config.boardWidth) {
        linesToRemove.push(row)
      }
    }
    if (linesToRemove.length > 0) {
      removeFullLines(linesToRemove)
      addPoints(linesToRemove.length)
    }
    return linesToRemove.length
  }

  function removeFullLines (lines) {
    for (let lineIndex in lines) {
      const line = lines[lineIndex]
      for (let j = 0; j < config.boardWidth; j++) {
        board[line][j] = 0
      }
      for (let i = line; i > 0; i--) {
        board[i] = board[i - 1]
      }
    }
    return lines.length
  }

  function addPoints (lines) {
    let bonus = 1
    if (lines > 1) bonus += 2
    if (lines > 2) bonus += 3
    if (lines > 3) bonus += 4

    for (let i = 0; i < bonus; i++) {
      if ((points + bonus) % config.pointsForLevelingUp == 0) {
        changeLevel()
      }
    }

    points += bonus
    return bonus
  }

  function changeLevel () {
    ++currentLevel
    if (currentLevel < 10) {
      currentSpeed -= config.speedIncreasePerLevel
    } else if (currentLevel < 20) {
      currentSpeed -= config.speedIncreasePerLevel / 2
    } else {
      currentSpeed -= config.speedIncreasePerLevel / 4
    }
    return currentLevel
  }

  function rotate (direction) {
    if (direction === 'left') {
      rotationStep = rotationStep - 1 < 0 ? 3 : rotationStep - 1
    } else {
      rotationStep = rotationStep + 1 > 3 ? 0 : rotationStep + 1
    }
    return rotationStep
  }

  function initEvents () {
    if (window) window.addEventListener('keydown', function (event) {
      const key = event.key.toLowerCase()
      if (gamePaused) { // da bi sprečili da se pozivaju druge opcije ako je igra pauzirana
        if (key == ' ') {
          resumeGame()
        }
      } else if (key == 'arrowright' || key == 'd') {
        if (canIMoveRight()) ++currrentStartColumn
      } else if (key == 'arrowleft' || key == 'a') {
        if (canIMoveLeft()) --currrentStartColumn
      } else if (key == 'arrowdown' || key == 's') {
        moveDownFast()
      } else if (key == 'arrowup' || key == 'w') {
        if (canIRotateLeft()) rotate('left')
      } else if (key == 'e') {
        if (canIRotateRight()) rotate('right')
      } else if (key == 'n') {
        newGame()
      } else if (key == 'q') {
        quitGame()
      } else if (key == ' ') {
        pauseGame()
      } else {
        // console.log(event.key);
      }
      putShapeOnTable(shape, distanceFromTop)
      renderGame()
    })
  }

  function initMouseEvents () {
    window.addEventListener('contextmenu', function (event) {
      event.preventDefault()
    })
    window.addEventListener('mousedown', function (event) {
      dragStartPoint = [event.clientX, event.clientY]
    })
    window.addEventListener('mouseup', function (event) {
      const dragEndPoint = [event.clientX, event.clientY]
      const deltaX = dragStartPoint[0] - dragEndPoint[0]
      const deltaY = dragStartPoint[1] - dragEndPoint[1]
      if (Math.abs(deltaX) > Math.abs(deltaY)) {// horizontalMove
        if (deltaX > 0) {
          if (canIMoveLeft()) --currrentStartColumn
        } else {
          if (canIMoveRight()) ++currrentStartColumn
        }
      } else {// vertical control
        if (deltaY > 0) {
          if (canIRotateRight()) rotate('right')
        } else {
          moveDownFast()
        }
      }
    })
  }

  // METHODS FOR EXTENDING START
  function renderGame () {
    // CONSOLE.LOG
    renderGameConsole()
    // DOM
    renderGameDOM()
    // CANVAS
    renderGameCanvas()
    // WEBGL

  }

// CONSOLE VERSION START
  function renderGameConsole () {
    console.clear()
    renderTable()
    renderPoints()
    renderTimer()
    renderControls()
    renderNextShapePreview()
  }

  function renderTable () {
    let returnString = '|' + '-'.repeat(parseInt(config.boardWidth)) + '|\n'
    for (let i = 1; i < config.boardHeight; i++) {
      returnString += '|'
      for (let j = 0; j < config.boardWidth; j++) {
        returnString += board[i][j] == 0 ? ' ' : '#'// 0 empty, 1 taken, 2 moving piece - row bellow is for testing
        // returnString += board[i][j] == 0 ? " " : board[i][j];// 0 empty, 1 taken, 2 moving piece
      }
      returnString += '|\n'
    }
    returnString += '|' + '-'.repeat(config.boardWidth) + '|\n'
    console.log('%c' + returnString, 'color:green;padding:0;background:black;letter-spacing:4px')
  }

  function renderPoints () {
    console.log('%cPoints:' + points + ' Level: ' + currentLevel + ' Speed: ' + currentSpeed, 'background:red;color:#fff')
  }

  function renderTimer () {
    const now = +new Date()
    const pre = +startTime
    console.log('%c Time:' + Math.floor((now - pre) / 1000), 'background:black;color:yellow')
  }

  function renderControls () {
    console.log('a - left, d - right, s - down, w - rotate, space - pause/resume, n - new game')
  }

  function renderNextShapePreview () {
    console.log('%cNext shape: %c' + nextShape[9], 'background:black;color:yellow;padding:5px;margin:0;', 'background:black;color:red;padding:5px;margin:0;')
  }

// CONSOLE VERSION END

  // DOM VERSION START
  function renderGameDOM () {
    if (!document.getElementById('TetrisGameHolder')) {
      let tableHTML = '<table>'
      for (let i = 1; i < config.boardHeight; i++) {
        tableHTML += '<tr id=\'row' + i + '\'>'
        for (let j = 0; j < config.boardWidth; j++) {
          tableHTML += '<td id=\'cell_' + i + '_' + j + '\'> </td>'
        }
        tableHTML += '</tr>'
      }
      tableHTML += '</table>'
      const tetrisHtml = '<div id="TetrisGameHolder"><div id="tetrisTable">' + tableHTML + '</div><div id="tetrisPoints"></div><div id="tetrisTimer"></div><div id="tetrisControls"></div><div id="TetrisNextShape"></div></div>'
      const style = document.createElement('style')
      style.id = 'tetrisGameStyleSheet'
      style.innerHTML = '#tetrisTable td.TetrisFullCell{background:red} #tetrisTable td{width:20px;height:20px;border:solid #ccc 1px;}'
      document.head.appendChild(style)
      document.body.insertAdjacentHTML('afterbegin', tetrisHtml)
    }
    renderTableDOM()
    renderPointsDOM()
    renderTimerDOM()
    renderControlsDOM()
    renderNextShapePreviewDOM()
  }

  function renderTableDOM () {
    for (let i = 1; i < config.boardHeight; i++) {
      for (let j = 0; j < config.boardWidth; j++) {
        const el = document.getElementById('cell_' + i + '_' + j)
        if (el) el.setAttribute('class', board[i][j] == 0 ? '' : 'TetrisFullCell')
      }
    }
  }

  function renderPointsDOM () {
    document.getElementById('tetrisPoints').innerHTML = 'Points:' + points + ' Level: ' + currentLevel + ' Speed: ' + currentSpeed
  }

  function renderTimerDOM () {
    const now = +new Date()
    const pre = +startTime
    document.getElementById('tetrisTimer').innerHTML = 'Time:' + Math.floor((now - pre) / 1000)
  }

  function renderControlsDOM () {
    document.getElementById('tetrisControls').innerHTML = 'a - left, d - right, s - down, w - rotate, space - pause/resume, n - new game'
  }

  function renderNextShapePreviewDOM () {
    document.getElementById('TetrisNextShape').innerHTML = '<pre>Next shape: <br>' + nextShape[9] + '</pre>'
  }

  // DOM VERSION END

  // CANVAS VERSION START
  function renderGameCanvas () {
    if (!document.getElementById('TetrisGameHolderCanvas')) {
      const canvas = document.createElement('canvas')
      canvas.id = 'TetrisGameHolderCanvas'
      canvas.width = (config.boardWidth + 10) * 20
      canvas.height = config.boardHeight * 20
      document.body.appendChild(canvas)
    }
    renderTableCanvas()
    renderPointsCanvas()
    renderTimerCanvas()
    //renderControlsCanvas();
    renderNextShapePreviewCanvas()
  }

  function renderTableCanvas () {
    console.log('render table canvas')
    const c = document.getElementById('TetrisGameHolderCanvas')
    const ctx = c.getContext('2d')
    for (let i = 1; i < config.boardHeight; i++) {
      for (let j = 0; j < config.boardWidth; j++) {
        ctx.beginPath()
        ctx.rect(j * 20, i * 20, 20, 20)
        ctx.strokeStyle = '#cccccc'
        ctx.stroke()
        ctx.fillStyle = board[i][j] === 0 ? 'blue' : 'red'//
        ctx.fill()
      }
    }
  }

  function renderPointsCanvas () {
    const c = document.getElementById('TetrisGameHolderCanvas')
    const leftStartPoint = config.boardWidth * 20 + 20
    const ctx = c.getContext('2d')
    ctx.beginPath()
    ctx.rect(leftStartPoint - 10, 20, 120, 100)
    ctx.strokeStyle = '#cccccc'
    ctx.stroke()
    ctx.fillStyle = 'orange'
    ctx.fill()
    ctx.fillStyle = 'black'
    ctx.font = '15px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Points:' + points, leftStartPoint, 40)
    ctx.fillText('Level: ' + currentLevel, leftStartPoint, 60)
    ctx.fillText('Speed: ' + currentSpeed, leftStartPoint, 80)
  }

  function renderTimerCanvas () {
    const c = document.getElementById('TetrisGameHolderCanvas')
    const leftStartPoint = config.boardWidth * 20 + 20
    const ctx = c.getContext('2d')
    ctx.beginPath()
    ctx.rect(leftStartPoint - 10, 120, 120, 30)
    ctx.fillStyle = 'black'
    ctx.fill()
    ctx.fillStyle = 'yellow'
    ctx.font = '15px Arial'
    ctx.textAlign = 'left'
    const now = +new Date()
    const pre = +startTime
    ctx.fillText('Time: ' + Math.floor((now - pre) / 1000), leftStartPoint, 140)
  }

  function renderControlsCanvas () {
    document.getElementById('tetrisControls').innerHTML = 'a - left, d - right, s - down, w - rotate, space - pause/resume, n - new game'
  }

  function renderNextShapePreviewCanvas () {
    const c = document.getElementById('TetrisGameHolderCanvas')
    const leftStartPoint = config.boardWidth * 20 + 20
    const ctx = c.getContext('2d')
    const nextShapeString = nextShape[9].replace(/\n/g, 'x')
    let fromLeft = 0,
      fromTop = 0
    ctx.beginPath()
    ctx.rect(leftStartPoint - 10, 150, 120, 60)
    ctx.fillStyle = 'red'
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.font = '15px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Next shape:', leftStartPoint, 170)
    ctx.strokeStyle = '#cccccc'
    ctx.beginPath()
    ctx.rect(leftStartPoint - 10, 210, 120, 70)
    ctx.fillStyle = 'green'
    ctx.fill()
    for (let i = 0; i < nextShapeString.length; i++) {
      const current = nextShapeString.substr(i, 1)
      if (current === 'x') {
        fromTop += 20
        fromLeft = 0
      } else {
        ctx.beginPath()
        ctx.rect(leftStartPoint + fromLeft, 220 + fromTop, 20, 20)
        ctx.fillStyle = nextShapeString.substr(i, 1) === '#' ? 'yellow' : 'green'
        ctx.fill()
        fromLeft += 20
      }

    }

  }

// CANVAS VERSION END

  return {
    startGame: startGame,
    initEvents: initEvents,
    initMouseEvents: initMouseEvents
  }

}

const tetris = new Tetris()
tetris.startGame()
tetris.initEvents()
tetris.initMouseEvents()
