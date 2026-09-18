// ===================================
// CALCULATOR STATE
// ===================================
let currentMode = 'basic';
let displayValue = '0';
let previousValue = null;
let operation = null;
let waitingForOperand = false;
let memory = 0;
let lastAnswer = 0;
let history = [];
let shiftMode = false;
let angleMode = 'deg'; // deg or rad

// ===================================
// DISPLAY FUNCTIONS
// ===================================
function updateDisplay() {
    const displayMain = document.getElementById('displayMain');
    const displaySecondary = document.getElementById('displaySecondary');
    const displayMemory = document.getElementById('displayMemory');

    displayMain.textContent = displayValue;
    
    if (operation && previousValue !== null) {
        displaySecondary.textContent = `${previousValue} ${getOperatorSymbol(operation)}`;
    } else {
        displaySecondary.textContent = '';
    }

    displayMemory.textContent = memory !== 0 ? 'M' : '';
}

function getOperatorSymbol(op) {
    const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷', 'xʸ': '^' };
    return symbols[op] || op;
}

// ===================================
// CALCULATOR LOGIC
// ===================================
function inputDigit(digit) {
    if (waitingForOperand) {
        displayValue = String(digit);
        waitingForOperand = false;
    } else {
        displayValue = displayValue === '0' ? String(digit) : displayValue + digit;
    }
    updateDisplay();
}

function inputDecimal() {
    if (waitingForOperand) {
        displayValue = '0.';
        waitingForOperand = false;
    } else if (displayValue.indexOf('.') === -1) {
        displayValue += '.';
    }
    updateDisplay();
}

function clear() {
    displayValue = '0';
    previousValue = null;
    operation = null;
    waitingForOperand = false;
    updateDisplay();
}

function deleteLastChar() {
    if (displayValue.length > 1) {
        displayValue = displayValue.slice(0, -1);
    } else {
        displayValue = '0';
    }
    updateDisplay();
}

function performOperation(nextOperation) {
    const inputValue = parseFloat(displayValue);

    if (previousValue === null) {
        previousValue = inputValue;
    } else if (operation) {
        const result = calculate(previousValue, inputValue, operation);
        displayValue = String(result);
        previousValue = result;
    }

    waitingForOperand = true;
    operation = nextOperation;
    updateDisplay();
}

function calculate(firstOperand, secondOperand, operation) {
    let result;
    switch (operation) {
        case '+':
            result = firstOperand + secondOperand;
            break;
        case '-':
            result = firstOperand - secondOperand;
            break;
        case '*':
            result = firstOperand * secondOperand;
            break;
        case '/':
            result = firstOperand / secondOperand;
            break;
        case 'xʸ':
            result = Math.pow(firstOperand, secondOperand);
            break;
        default:
            return secondOperand;
    }
    return result;
}

function calculateResult() {
    const inputValue = parseFloat(displayValue);

    if (operation && previousValue !== null) {
        const result = calculate(previousValue, inputValue, operation);
        
        // Add to history
        addToHistory(`${previousValue} ${getOperatorSymbol(operation)} ${inputValue}`, result);
        
        displayValue = String(result);
        lastAnswer = result;
        previousValue = null;
        operation = null;
        waitingForOperand = true;
        updateDisplay();
    }
}

// ===================================
// SCIENTIFIC FUNCTIONS
// ===================================
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function scientificFunction(func) {
    const value = parseFloat(displayValue);
    let result;

    try {
        switch (func) {
            case 'sin':
                result = shiftMode 
                    ? (angleMode === 'deg' ? toDegrees(Math.asin(value)) : Math.asin(value))
                    : Math.sin(angleMode === 'deg' ? toRadians(value) : value);
                break;
            case 'cos':
                result = shiftMode 
                    ? (angleMode === 'deg' ? toDegrees(Math.acos(value)) : Math.acos(value))
                    : Math.cos(angleMode === 'deg' ? toRadians(value) : value);
                break;
            case 'tan':
                result = shiftMode 
                    ? (angleMode === 'deg' ? toDegrees(Math.atan(value)) : Math.atan(value))
                    : Math.tan(angleMode === 'deg' ? toRadians(value) : value);
                break;
            case 'x²':
                result = shiftMode ? Math.sqrt(value) : Math.pow(value, 2);
                break;
            case 'log':
                result = shiftMode ? Math.pow(10, value) : Math.log10(value);
                break;
            case 'ln':
                result = shiftMode ? Math.exp(value) : Math.log(value);
                break;
            case 'reciprocal':
                result = shiftMode ? Math.abs(value) : 1 / value;
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'exp':
                displayValue += 'e';
                updateDisplay();
                return;
            case '%':
                if (previousValue !== null && operation) {
                    result = (previousValue * value) / 100;
                } else {
                    result = value / 100;
                }
                break;
            default:
                return;
        }

        if (isNaN(result) || !isFinite(result)) {
            showError('Math Error');
            return;
        }

        displayValue = String(result);
        waitingForOperand = true;
        shiftMode = false;
        updateDisplay();
        
    } catch (error) {
        showError('Error');
    }
}

// ===================================
// MEMORY FUNCTIONS
// ===================================
function memoryClear() {
    memory = 0;
    updateDisplay();
}

function memoryAdd() {
    memory += parseFloat(displayValue);
    waitingForOperand = true;
    updateDisplay();
}

function memorySubtract() {
    memory -= parseFloat(displayValue);
    waitingForOperand = true;
    updateDisplay();
}

function memoryRecall() {
    displayValue = String(memory);
    waitingForOperand = true;
    updateDisplay();
}

// ===================================
// HISTORY FUNCTIONS
// ===================================
function addToHistory(expression, result) {
    history.unshift({ expression, result });
    if (history.length > 50) {
        history.pop();
    }
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="recallHistory(${index})">
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        </div>
    `).join('');
}

function recallHistory(index) {
    displayValue = String(history[index].result);
    waitingForOperand = true;
    updateDisplay();
}

function clearHistory() {
    history = [];
    updateHistoryDisplay();
}

// ===================================
// ERROR HANDLING
// ===================================
function showError(message) {
    const displayMain = document.getElementById('displayMain');
    displayMain.textContent = message;
    displayMain.classList.add('error-shake');
    setTimeout(() => {
        displayMain.classList.remove('error-shake');
        clear();
    }, 1500);
}

// ===================================
// MODE SWITCHING
// ===================================
function switchMode(mode) {
    currentMode = mode;
    const displayMode = document.getElementById('displayMode');
    const modeButtons = document.querySelectorAll('.mode-btn');
    
    // Update mode buttons
    modeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });

    // Update display mode text
    const modeText = {
        'basic': 'COMP',
        'scientific': 'SCI',
        'matrix': 'MAT',
        'currency': 'CURRENCY'
    };
    displayMode.textContent = modeText[mode];

    // Show appropriate modal or calculator
    if (mode === 'matrix') {
        document.getElementById('matrixModal').classList.add('active');
    } else if (mode === 'currency') {
        document.getElementById('currencyModal').classList.add('active');
    }
}

// ===================================
// MATRIX CALCULATOR
// ===================================
let matrixA = [];
let matrixB = [];

function generateMatrixInput(matrixId, rows, cols) {
    const container = document.getElementById(`${matrixId}Input`);
    container.innerHTML = `<h3>Matrix ${matrixId.slice(-1).toUpperCase()}</h3>`;
    
    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, 60px)`;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = '0';
            input.step = '0.01';
            input.dataset.row = i;
            input.dataset.col = j;
            input.dataset.matrix = matrixId;
            grid.appendChild(input);
        }
    }
    
    container.appendChild(grid);
    container.classList.add('active');
}

function getMatrixFromInputs(matrixId) {
    const inputs = document.querySelectorAll(`input[data-matrix="${matrixId}"]`);
    const rows = parseInt(document.getElementById(`${matrixId}Rows`).value);
    const cols = parseInt(document.getElementById(`${matrixId}Cols`).value);
    
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            const input = document.querySelector(`input[data-matrix="${matrixId}"][data-row="${i}"][data-col="${j}"]`);
            matrix[i][j] = parseFloat(input.value) || 0;
        }
    }
    return matrix;
}

function matrixDeterminant(matrix) {
    const n = matrix.length;
    if (n !== matrix[0].length) return 'Not a square matrix';
    
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    
    let det = 0;
    for (let j = 0; j < n; j++) {
        det += Math.pow(-1, j) * matrix[0][j] * matrixDeterminant(getMinor(matrix, 0, j));
    }
    return det;
}

function getMinor(matrix, row, col) {
    return matrix.filter((_, i) => i !== row)
                 .map(row => row.filter((_, j) => j !== col));
}

function matrixTranspose(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

function matrixInverse(matrix) {
    const det = matrixDeterminant(matrix);
    if (det === 0) return 'Singular matrix (determinant = 0)';
    
    const n = matrix.length;
    if (n === 2) {
        return [
            [matrix[1][1] / det, -matrix[0][1] / det],
            [-matrix[1][0] / det, matrix[0][0] / det]
        ];
    }
    
    return 'Inverse calculation for matrices larger than 2×2 requires more complex implementation';
}

function matrixAdd(matrixA, matrixB) {
    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
        return 'Matrices must have same dimensions';
    }
    return matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));
}

function matrixSubtract(matrixA, matrixB) {
    if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
        return 'Matrices must have same dimensions';
    }
    return matrixA.map((row, i) => row.map((val, j) => val - matrixB[i][j]));
}

function matrixMultiply(matrixA, matrixB) {
    if (matrixA[0].length !== matrixB.length) {
        return 'Invalid dimensions for multiplication';
    }
    
    const result = [];
    for (let i = 0; i < matrixA.length; i++) {
        result[i] = [];
        for (let j = 0; j < matrixB[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < matrixA[0].length; k++) {
                sum += matrixA[i][k] * matrixB[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function displayMatrixResult(result) {
    const resultDiv = document.getElementById('matrixResult');
    
    if (typeof result === 'string') {
        resultDiv.textContent = result;
        return;
    }
    
    if (typeof result === 'number') {
        resultDiv.textContent = result.toFixed(4);
        return;
    }
    
    // Display matrix
    let html = '<table style="margin: auto; border-collapse: collapse;">';
    result.forEach(row => {
        html += '<tr>';
        row.forEach(val => {
            html += `<td style="padding: 8px; border: 1px solid #4a5568; text-align: center;">
                        ${val.toFixed(2)}
                     </td>`;
        });
        html += '</tr>';
    });
    html += '</table>';
    resultDiv.innerHTML = html;
}

// ===================================
// CURRENCY CONVERTER
// ===================================
const exchangeRates = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CNY: 7.24,
    INR: 83.12,
    AUD: 1.52,
    CAD: 1.36,
    CHF: 0.88,
    KRW: 1308.50,
    BRL: 4.97,
    MXN: 17.15
};

function convertCurrency() {
    const amount = parseFloat(document.getElementById('currencyAmount').value);
    const from = document.getElementById('currencyFrom').value;
    const to = document.getElementById('currencyTo').value;
    
    if (isNaN(amount) || amount < 0) {
        document.getElementById('currencyResult').innerHTML = 
            '<div class="result-display" style="color: #fc8181;">Invalid amount</div>';
        return;
    }
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / exchangeRates[from];
    const result = amountInUSD * exchangeRates[to];
    
    const rate = exchangeRates[to] / exchangeRates[from];
    
    document.getElementById('currencyResult').innerHTML = 
        `<div class="result-display">${result.toFixed(2)} ${to}</div>`;
    
    document.getElementById('exchangeRateInfo').innerHTML = 
        `Exchange Rate: 1 ${from} = ${rate.toFixed(4)} ${to}`;
}

function swapCurrencies() {
    const fromSelect = document.getElementById('currencyFrom');
    const toSelect = document.getElementById('currencyTo');
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
}

// ===================================
// EVENT LISTENERS
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    updateHistoryDisplay();

    // Calculator button events
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const value = button.dataset.value;

            if (value !== undefined) {
                if (value === '.') {
                    inputDecimal();
                } else {
                    inputDigit(value);
                }
            } else if (action) {
                handleAction(action);
            }
        });
    });

    // Mode switching
    document.querySelectorAll('.mode-btn').forEach(button => {
        button.addEventListener('click', () => {
            switchMode(button.dataset.mode);
        });
    });

    // History clear
    document.getElementById('clearHistory').addEventListener('click', clearHistory);

    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.close;
            document.getElementById(modalId).classList.remove('active');
            switchMode('basic');
        });
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                switchMode('basic');
            }
        });
    });

    // Matrix operations
    document.getElementById('generateMatrixA').addEventListener('click', () => {
        const rows = parseInt(document.getElementById('matrixARows').value);
        const cols = parseInt(document.getElementById('matrixACols').value);
        generateMatrixInput('matrixA', rows, cols);
    });

    document.getElementById('generateMatrixB').addEventListener('click', () => {
        const rows = parseInt(document.getElementById('matrixBRows').value);
        const cols = parseInt(document.getElementById('matrixBCols').value);
        generateMatrixInput('matrixB', rows, cols);
    });

    document.querySelectorAll('.matrix-op-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const operation = btn.dataset.op;
            const matrixBControls = document.getElementById('matrixBControls');
            
            // Show/hide matrix B input based on operation
            if (['add', 'subtract', 'multiply'].includes(operation)) {
                matrixBControls.style.display = 'block';
                if (!document.getElementById('matrixBInput').classList.contains('active')) {
                    const rows = parseInt(document.getElementById('matrixBRows').value);
                    const cols = parseInt(document.getElementById('matrixBCols').value);
                    generateMatrixInput('matrixB', rows, cols);
                }
            } else {
                matrixBControls.style.display = 'none';
            }
            
            performMatrixOperation(operation);
        });
    });

    // Currency converter
    document.getElementById('convertBtn').addEventListener('click', convertCurrency);
    document.getElementById('swapCurrency').addEventListener('click', swapCurrencies);

    // Keyboard support
    document.addEventListener('keydown', handleKeyboard);

    // Generate initial matrix A
    generateMatrixInput('matrixA', 2, 2);
});

function handleAction(action) {
    switch (action) {
        case 'clear':
            clear();
            break;
        case 'delete':
            deleteLastChar();
            break;
        case '=':
            calculateResult();
            break;
        case '+':
        case '-':
        case '*':
        case '/':
            performOperation(action);
            break;
        case 'xʸ':
            performOperation('xʸ');
            break;
        case 'shift':
            shiftMode = !shiftMode;
            break;
        case 'mode':
            angleMode = angleMode === 'deg' ? 'rad' : 'deg';
            alert(`Angle mode: ${angleMode.toUpperCase()}`);
            break;
        case 'mem-clear':
            memoryClear();
            break;
        case 'mem-add':
            memoryAdd();
            break;
        case 'mem-sub':
            memorySubtract();
            break;
        case 'mem-recall':
            memoryRecall();
            break;
        case 'ans':
            displayValue = String(lastAnswer);
            waitingForOperand = true;
            updateDisplay();
            break;
        default:
            scientificFunction(action);
            break;
    }
}

function performMatrixOperation(operation) {
    if (!document.getElementById('matrixAInput').classList.contains('active')) {
        displayMatrixResult('Please generate Matrix A first');
        return;
    }

    const matrixA = getMatrixFromInputs('matrixA');
    let result;

    switch (operation) {
        case 'determinant':
            result = matrixDeterminant(matrixA);
            break;
        case 'transpose':
            result = matrixTranspose(matrixA);
            break;
        case 'inverse':
            result = matrixInverse(matrixA);
            break;
        case 'add':
            if (!document.getElementById('matrixBInput').classList.contains('active')) {
                displayMatrixResult('Please generate Matrix B first');
                return;
            }
            const matrixB_add = getMatrixFromInputs('matrixB');
            result = matrixAdd(matrixA, matrixB_add);
            break;
        case 'subtract':
            if (!document.getElementById('matrixBInput').classList.contains('active')) {
                displayMatrixResult('Please generate Matrix B first');
                return;
            }
            const matrixB_sub = getMatrixFromInputs('matrixB');
            result = matrixSubtract(matrixA, matrixB_sub);
            break;
        case 'multiply':
            if (!document.getElementById('matrixBInput').classList.contains('active')) {
                displayMatrixResult('Please generate Matrix B first');
                return;
            }
            const matrixB_mul = getMatrixFromInputs('matrixB');
            result = matrixMultiply(matrixA, matrixB_mul);
            break;
    }

    displayMatrixResult(result);
}

function handleKeyboard(event) {
    const key = event.key;

    if (key >= '0' && key <= '9') {
        inputDigit(key);
    } else if (key === '.') {
        inputDecimal();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        performOperation(key);
    } else if (key === 'Enter' || key === '=') {
        calculateResult();
        event.preventDefault();
    } else if (key === 'Escape') {
        clear();
    } else if (key === 'Backspace') {
        deleteLastChar();
        event.preventDefault();
    }
}
