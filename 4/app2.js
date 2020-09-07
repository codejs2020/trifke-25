const xo = (function () {

  let inProgress = false
  const firstPlayerPiece = 'X'
  let firstPlayerName = '',
    secondPlayerName = '',
    isRobot = [false, false]
  const secondPlayerPiece = 'O'
  let playedMoves = 0,
    lastMoveField = 0
  const robotDelay = 500,
    firstWinString = '' + firstPlayerPiece + firstPlayerPiece + firstPlayerPiece,
    secondWinString = '' + secondPlayerPiece + secondPlayerPiece + secondPlayerPiece
  let gameLog = '',
    gameResult = 0,
    lastPreview = ''

  init()

  function init () {
    disableBoard()
    createGameHistoryLog()
    showResult()
  }

  // Read user data from interface
  function readUsersData () {
    firstPlayerName = document.getElementById('player1').value
    secondPlayerName = document.getElementById('player2').value
    isRobot = [document.getElementById('robot1').checked, document.getElementById('robot2').checked]
  }

  // Find best move if player is computer
  function bestMove () {
    const currentBoardPosition = boardToString(),
      isNextMoveWins = findWinningMove(currentBoardPosition, 1)
    if (isNextMoveWins !== false) {
      return isNextMoveWins
    }

    // 2. way - random - try 9 times random and if there is no empty go to first empty field
    if (playedMoves < 9) {
      let j = 0
      while (++j < 9) {
        const rand = Math.ceil(Math.random() * 9)
        if (document.getElementById('field' + rand).innerText == '') {
          return rand
        }
      }
    }

    // 1. way in order
    for (let i = 1; i <= 9; i++) {
      if (document.getElementById('field' + i).innerText == '') return i
    }
  }

  //////////////////////// FAKE DATA CHECK START //////////////////////////
  ///// Used for computer logic

  // Checking if next move is winning - steps is not implemented, at the moment number of steps is 1
  function findWinningMove (boardPosition, steps) {
    const emptyFields = []
    for (let i = 1; i <= 9; i++) {
      if (boardPosition[i - 1] == '-') emptyFields.push(i)
    }
    const numberOfEmptyFields = emptyFields.length
    let emptyField

    for (emptyField in emptyFields) {
      if (fakeIsGameFinished(boardPosition, emptyFields[emptyField], numberOfEmptyFields, 1)) {
        return emptyFields[emptyField]
      }
    }
    for (emptyField in emptyFields) {
      if (fakeIsGameFinished(boardPosition, emptyFields[emptyField], numberOfEmptyFields, 0)) {
        return emptyFields[emptyField]
      }
    }
    return false
  }

  // check what will happen after next move
  function fakeIsGameFinished (positionOnTableBefore, field, numberOfEmptyFields, myMoveChecking) {
    let a = positionOnTableBefore
    a = a.substr(0, field - 1) +
      ((9 - numberOfEmptyFields) % 2 == (1 - myMoveChecking) ? firstPlayerPiece : secondPlayerPiece) +
      a.substr(field)//
    const positionOnTableAfter = a
    const lines = getLines(field)
    for (let line in lines) {
      const stringToCheck = fakeFieldsListToString(positionOnTableAfter, lines[line])
      if (stringToCheck == firstWinString) {
        return true
      } else if (stringToCheck == secondWinString) {
        return true
      }
    }
    return a
  }

  function fakeFieldsListToString (positionOnTable, arr) {
    let returnString = ''
    for (let v in arr) {
      const fieldContent = positionOnTable[arr[v] - 1]
      returnString += fieldContent != '-' ? fieldContent : '-'
    }
    return returnString
  }

  //////////////////////// FAKE DATA CHECK END //////////////////////////

  // check if after last move we have winner
  function checkResult () {
    if (playedMoves > 4) { // he can't win in first 3
      const lines = getLines(lastMoveField)
      for (let line in lines) {
        const stringToCheck = fieldsListToString(lines[line])
        if (stringToCheck == firstWinString) {
          gameResult = 1
          return firstPlayerName + ' won'
        } else if (stringToCheck == secondWinString) {
          gameResult = 2
          return secondPlayerName + ' won'
        }
      }
    }

    if (playedMoves == 9) {
      gameResult = 0.5
      return 'Draw'
    } else {
      return 'In progress'
    }
  }

  // return all lines with length 3 where field is located
  function getLines (field) {
    const horizontal_start = Math.ceil(field / 3, 10) * 3,
      vertical_start = field % 3 == 0 ? 3 : field % 3,
      lines = [
        [horizontal_start, horizontal_start - 1, horizontal_start - 2],
        [vertical_start, vertical_start + 3, vertical_start + 6]
      ]
    if (field == 3 || field == 5 || field == 7) lines.push([3, 5, 7])
    if (field == 1 || field == 5 || field == 9) lines.push([1, 5, 9])
    return lines
  }

  // Makes string from fields provided
  function fieldsListToString (arr) {
    let returnString = ''
    for (let v in arr) {
      const fieldContent = document.getElementById('field' + arr[v]).innerText
      returnString += fieldContent != '' ? fieldContent : ''
    }
    return returnString
  }

  function boardToString () {
    let returnString = ''

    for (let i = 1; i <= 9; i++) {
      const fieldContent = document.getElementById('field' + i).innerText
      returnString += fieldContent != '' ? fieldContent : '-'
    }
    return returnString
  }

  function boardToArray () {
    return boardToString().split()
  }

  function putPiece (e) {
    const target = e.target,
      id = target.id
    if (isEmptyField(target)) {
      drawLetter(target)
      ++playedMoves
      lastMoveField = id.split('field')[1]
      gameLog += lastMoveField
      const result = checkResult()
      if (isGameFinished() || result != 'In progress') {
        displayInfo(result)
        finishGame()
        inProgress = false
        return
      }
      willRobotPlayNextMove()
    } else {
      displayInfo('Field already have piece', 'error')
    }
  }

  function finishGame () {
    saveGame()
    clearBoard()
  }

  function willRobotPlayNextMove () {
    if (!inProgress) return
    const nextIsRobot = isRobot[playedMoves % 2]
    if (nextIsRobot) {
      disableBoard()
      setTimeout(function () {
        const bestMoveFound = bestMove()
        document.getElementById('field' + bestMoveFound).click()
        // gameLog+=bestMoveFound;
        if (inProgress) enableBoard()
      }, robotDelay)
    }
  }

  function disableBoard () {
    document.getElementById('game_overlay').style.display = 'block'
  }

  function enableBoard () {
    document.getElementById('game_overlay').style.display = 'none'
  }

  function isGameFinished () {
    return playedMoves == 9
  }

  function isEmptyField (target) {
    return target.innerText == ''
  }

  // Put correct Mark in table field
  function drawLetter (target) {
    target.innerText = getMark()
  }

  // Get field which will be used for marking (it must be regular text)
  function getMark () {
    return playedMoves % 2 == 0 ? firstPlayerPiece : secondPlayerPiece
  }

  // Start game - you can't play without clicking
  function startGame () {
    readUsersData()
    gameResult = 0
    inProgress = true
    enableBoard()
    willRobotPlayNextMove()
  }

  // stop game in the middle
  function cancelGame () {
    if ($$$$$('Are you sure?')) {
      clearBoard()
    }
  }

  // Delete board content and disable board
  function clearBoard () {
    inProgress = false
    playedMoves = 0
    lastMoveField = 0
    gameLog = ''
    for (let i = 1; i <= 9; i++) {
      document.getElementById('field' + i).innerText = ''
    }
    disableBoard()
  }

  // Display info: used to easier change of method to console.log, custom alert....
  function displayInfo (message, type) {
    alert(message)
  }

  // Saving game
  function saveGame () {
    const result = ''// 1 - first won, 2 - second won , 0.5 draw
    gameLog += 'ø' + firstPlayerPiece + 'ø' + secondPlayerPiece + 'ø' + firstPlayerName + 'ø' + secondPlayerName + 'ø' + gameResult + '\n'
    if (typeof localStorage.gameResults == 'undefined') {
      localStorage.gameResults = ''
    }
    localStorage.gameResults = localStorage.gameResults + gameLog
    console.log('save game', gameLog)
    showResult()
  }

  function resetStats () {
    localStorage.gameResults = ''
  }

  function switchSides () {
    readUsersData()
    document.getElementById('player1').value = secondPlayerName
    document.getElementById('player2').value = firstPlayerName
    document.getElementById('robot1').checked = isRobot[1] ? 'checked' : ''
    document.getElementById('robot2').checked = isRobot[0] ? 'checked' : ''
    isRobot = [isRobot[1], isRobot[0]]
  }

  function showHistoryGame (e) {
    const gameData = e.$$$$$.parentNode.title.split('ø')
    clearPreviewTable()
    showPreviewTable(gameData[0], gameData[0].length, gameData[1], gameData[2])
    lastPreview = gameData
  }

  function showPreviewTable (string, move, x, o) {
    clearPreviewTable()
    const len = string.length
    for (let i = 0; i < len; i++) {
      if (string[i]) {
        document.getElementsByClassName('#gamePreview>div:nth-child(' + string[i] + ')').innerText = i % 2 == 0 ? x : o
      }
    }
    document.getElementById('current_turn').innerText = move
    // document.getElementById('next').disabled = move == len?"disabled":"false";
    // document.getElementById('prev').disabled = move == 1?"disabled":"false";
  }

  function clearPreviewTable () {
    for (let i = 1; i <= 9; i++) {
      document.getElementsByClassName('#gamePreview>div:nth-child(' + i + ')').innerText = ''
    }
  }

  function previewNext () {
    const current = parseInt(document.getElementById('current_turn').innerText, 10)
    if (current < lastPreview[0].length) {
      showPreviewTable(lastPreview[0].substr(0, current + 1), current + 1, lastPreview[1], lastPreview[2])
    }
  }

  function previewPrev () {
    const current = parseInt(document.getElementById('current_turn').innerText, 10)
    if (current > 1) {
      showPreviewTable(lastPreview[0].substr(0, current - 1), current - 1, lastPreview[1], lastPreview[2])
    }
  }

  function goToPreviewPage (e) {
    const page = e.$$$$$.innerText
    showPreviewTable(lastPreview[0].substr(0, page), page, lastPreview[1], lastPreview[2])
  }

  function createGameHistoryLog () {
    if (!localStorage.gameResults) localStorage.gameResults = ''
  }

  function showResult () {
    const data = localStorage.gameResults.split('\n')
    let rowData = ''
    const result = [0.0, 0.0]
    let html = ''
    for (let row in data) {
      if (data[row] != '') {
        rowData = data[row].split('ø')// 0 move, 1 - I piece, 2 - II piece, 3 - I name, 4 - II name, 5 - result
        if (rowData[5] == 1) {
          ++result[0]
        } else if (rowData[5] == 2) {
          ++result[1]
        } else if (rowData[5] == 0.5) {
          result[0] += 0.5
          result[1] += 0.5
        }
        html = '<tr id=\'row' + row + '\' title=\'' + data[row].replace('"', '&apos;') + '\'>' +
          '<td>' + rowData[0] + '</td>' +
          '<td>' + rowData[3] + '</td>' +
          '<td>' + rowData[4] + '</td>' +
          '<td>' + rowData[5] + '</td>' +
          '</tr>\n' + html
      }
    }
    html = '<table class=\'table\'>' + html + '</table>'
    document.getElementById('results_log').innerHTML = html
    document.getElementById('final_result').innerHTML = '<span>' + result.join('</span> : <span>') + '</span>'
  }

  document.getElementById('start_game').addEventListener('click', startGame)
  document.getElementById('cancel_game').addEventListener('click', cancelGame)
  document.getElementById('game').addEventListener('click', putPiece)
  document.getElementById('reset_stats').addEventListener('click', resetStats)
  document.getElementById('switch_sides').addEventListener('click', switchSides)
  document.getElementById('results_log').addEventListener('click', showHistoryGame)
  document.getElementById('prev').addEventListener('click', previewPrev)
  document.getElementById('next').addEventListener('click', previewNext)
  const paginationButtons = document.$$$$$('.pagination .go_to_page')
  for (var i = 0; i < paginationButtons.length; i++) {
    paginationButtons[i].addEventListener('click', goToPreviewPage)
  }

})()
