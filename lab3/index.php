<?php
// Start the session to maintain state between requests
session_start();

// Initialize variables
$currentLevel = $_SESSION['currentLevel'] ?? 10;
$currentOperation = $_SESSION['currentOperation'] ?? '+';
$message = '';
$messageClass = '';
$operand1 = 0;
$operand2 = 0;
$operationSymbol = '+';
$correctAnswer = 0;

// Handle level selection
if (isset($_POST['level'])) {
    $currentLevel = (int)$_POST['level'];
    $_SESSION['currentLevel'] = $currentLevel;
}

// Handle operation selection
if (isset($_POST['operation'])) {
    $currentOperation = $_POST['operation'];
    $_SESSION['currentOperation'] = $currentOperation;
}

// Function to get a random number based on the current level
function getRandomNumber($level) {
    return mt_rand(0, $level);
}

// Generate a new equation
function generateEquation($level, $operation) {
    $num1 = getRandomNumber($level);
    $num2 = getRandomNumber($level);

    // Make sure subtraction doesn't result in negative numbers
    if ($operation === '-' && $num1 < $num2) {
        list($num1, $num2) = [$num2, $num1];
    }

    // Calculate the correct answer
    switch ($operation) {
        case '+':
            $answer = $num1 + $num2;
            $symbol = '+';
            break;
        case '-':
            $answer = $num1 - $num2;
            $symbol = '−';
            break;
        case '*':
            $answer = $num1 * $num2;
            $symbol = '×';
            break;
        default:
            $answer = $num1 + $num2;
            $symbol = '+';
    }

    return [
        'num1' => $num1,
        'num2' => $num2,
        'answer' => $answer,
        'symbol' => $symbol
    ];
}

// Generate a new equation or get the stored one
if (!isset($_SESSION['equation']) || isset($_POST['new_equation']) || isset($_POST['level']) || isset($_POST['operation'])) {
    $_SESSION['equation'] = generateEquation($currentLevel, $currentOperation);
}

$operand1 = $_SESSION['equation']['num1'];
$operand2 = $_SESSION['equation']['num2'];
$correctAnswer = $_SESSION['equation']['answer'];
$operationSymbol = $_SESSION['equation']['symbol'];

// Check the user's answer
if (isset($_POST['check_answer'])) {
    if (isset($_POST['user_answer']) && $_POST['user_answer'] !== '') {
        $userAnswer = (int)$_POST['user_answer'];
        
        if ($userAnswer === $correctAnswer) {
            $message = "Correct!";
            $messageClass = "correct";
            // Generate a new equation for the next round
            $_SESSION['equation'] = generateEquation($currentLevel, $currentOperation);
            $operand1 = $_SESSION['equation']['num1'];
            $operand2 = $_SESSION['equation']['num2'];
            $correctAnswer = $_SESSION['equation']['answer'];
            $operationSymbol = $_SESSION['equation']['symbol'];
        } else {
            $message = "Miss! The correct answer is {$correctAnswer}";
            $messageClass = "incorrect";
        }
    } else {
        $message = "Please enter a number!";
        $messageClass = "incorrect";
    }
}

// Handle "Try Again" button
if (isset($_POST['try_again'])) {
    $_SESSION['equation'] = generateEquation($currentLevel, $currentOperation);
    $operand1 = $_SESSION['equation']['num1'];
    $operand2 = $_SESSION['equation']['num2'];
    $correctAnswer = $_SESSION['equation']['answer'];
    $operationSymbol = $_SESSION['equation']['symbol'];
    $message = '';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mental Math Trainer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            background-color: #f5f5f5;
        }

        h1 {
            color: #333;
            margin-bottom: 30px;
        }

        .level-select,
        .operation-select {
            margin: 20px 0;
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .level-select button,
        .operation-select button {
            margin: 0 5px;
            padding: 8px 12px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .level-select button.active {
            background-color: #4caf50;
            color: white;
            transform: scale(1.05);
        }

        .operation-select button {
            width: 40px;
            font-size: 18px;
        }

        .operation-select button.active {
            background-color: #2196f3;
            color: white;
            transform: scale(1.05);
        }

        .calculation-area {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin: 20px 0;
        }

        .equation {
            margin: 20px 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 28px;
        }

        .equation input {
            width: 60px;
            height: 50px;
            text-align: center;
            font-size: 28px;
            margin: 0 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .equation input:disabled {
            background-color: #f9f9f9;
            color: #333;
        }

        .equation span {
            margin: 0 8px;
            font-weight: bold;
        }

        #userAnswer {
            width: 80px;
            height: 50px;
            text-align: center;
            font-size: 28px;
            margin: 0 8px;
            border: 2px solid #4caf50;
            border-radius: 4px;
        }

        .buttons-container {
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        .check-button {
            padding: 12px 24px;
            background-color: #4caf50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
        }

        .check-button:hover {
            background-color: #3e8e41;
        }

        .result {
            margin: 20px 0;
            font-size: 22px;
            font-weight: bold;
            min-height: 30px;
        }

        .correct {
            color: #4caf50;
        }

        .incorrect {
            color: #f44336;
        }

        .try-again-button {
            padding: 12px 24px;
            background-color: #2196f3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
        }

        .try-again-button:hover {
            background-color: #0b7dda;
        }

        .number-keyboard {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            max-width: 250px;
            margin: 20px auto;
            background-color: #e9e9e9;
            padding: 15px;
            border-radius: 8px;
        }

        .number-keyboard button {
            padding: 12px;
            font-size: 20px;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .number-keyboard button:hover {
            background-color: #e0e0e0;
        }

        #backspaceButton,
        #clearButton {
            background-color: #ff9800;
            color: white;
        }

        #backspaceButton:hover,
        #clearButton:hover {
            background-color: #e68a00;
        }
    </style>
</head>
<body>
    <h1>Mental Math Trainer</h1>

    <form method="post" action="">
        <div class="level-select">
            <h3>Select Level:</h3>
            <button type="submit" name="level" value="10" class="<?php echo $currentLevel == 10 ? 'active' : ''; ?>">0-10</button>
            <button type="submit" name="level" value="20" class="<?php echo $currentLevel == 20 ? 'active' : ''; ?>">0-20</button>
            <button type="submit" name="level" value="100" class="<?php echo $currentLevel == 100 ? 'active' : ''; ?>">0-100</button>
            <button type="submit" name="level" value="150" class="<?php echo $currentLevel == 150 ? 'active' : ''; ?>">0-150</button>
        </div>
    </form>

    <form method="post" action="">
        <div class="operation-select">
            <h3>Select Operation:</h3>
            <button type="submit" name="operation" value="+" class="<?php echo $currentOperation == '+' ? 'active' : ''; ?>">+</button>
            <button type="submit" name="operation" value="-" class="<?php echo $currentOperation == '-' ? 'active' : ''; ?>">−</button>
            <button type="submit" name="operation" value="*" class="<?php echo $currentOperation == '*' ? 'active' : ''; ?>">×</button>
        </div>
    </form>

    <div class="calculation-area">
        <form method="post" action="" id="mathForm">
            <div class="equation">
                <input type="text" id="operand1" value="<?php echo $operand1; ?>" disabled />
                <input type="text" id="operation" style="width: 40px" value="<?php echo $operationSymbol; ?>" disabled />
                <input type="text" id="operand2" value="<?php echo $operand2; ?>" disabled />
                <span>=</span>
                <input type="number" id="userAnswer" name="user_answer" autofocus />

                <div class="buttons-container">
                    <button type="submit" name="check_answer" class="check-button">Check</button>
                    <button type="submit" name="try_again" class="try-again-button">Try Again</button>
                </div>
            </div>

            <div class="number-keyboard">
                <?php for ($i = 1; $i <= 9; $i++): ?>
                    <button type="button" class="number-key" onclick="document.getElementById('userAnswer').value += '<?php echo $i; ?>'"><?php echo $i; ?></button>
                <?php endfor; ?>
                <button type="button" class="number-key" onclick="document.getElementById('userAnswer').value += '0'">0</button>
                <button type="button" id="backspaceButton" onclick="document.getElementById('userAnswer').value = document.getElementById('userAnswer').value.slice(0, -1)">⌫</button>
                <button type="button" id="clearButton" onclick="document.getElementById('userAnswer').value = ''">C</button>
            </div>
        </form>

        <div class="result <?php echo $messageClass; ?>" id="result"><?php echo $message; ?></div>
    </div>

    <script>
        // Minimal JavaScript needed for the number pad functionality
        // We keep this small piece of JS for better UX with the virtual keyboard
        document.getElementById('userAnswer').focus();
    </script>
</body>
</html>