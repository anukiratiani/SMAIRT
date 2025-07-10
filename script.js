let history = [];
let statsVisible = false;

const spellCheckDict = {
    'appel': 'apple', 'appels': 'apples', 'giv': 'give', 'lef': 'left', 'tota': 'total',
    'totl': 'total', 'solv': 'solve', 'numer': 'number', 'equels': 'equals', 'prise': 'price',
    'bigest': 'biggest', 'maxium': 'maximum', 'pluss': 'plus', 'tree': 'three', 'fiv': 'five',
    'intergrate': 'integrate', 'sqr': 'sqrt', 'perimiter': 'perimeter', 'bace': 'base',
    'two digited': 'two-digit', 'digited': 'digit', 'avrg': 'average', 'meen': 'mean',
    'mediam': 'median', 'mod': 'mode', 'rang': 'range', 'avrge': 'average', 'medn': 'median',
    'modde': 'mode', 'ranj': 'range',
    'standard deviation': 'standard deviation',
    'std dev': 'standard deviation',
    'stddev': 'standard deviation',
    'comb': 'combinations',
    'perm': 'permutations',
    'variance': 'variance'
};

function correctSpelling(text) {
    let corrected = text.toLowerCase();
    const sortedKeys = Object.keys(spellCheckDict).sort((a, b) => b.length - a.length);

    for (const wrong of sortedKeys) {
        const right = spellCheckDict[wrong];
        const regex = /\s/.test(wrong) ? new RegExp(`\\b${wrong}\\b`, 'gi') : new RegExp(wrong, 'gi');
        corrected = corrected.replace(regex, right);
    }
    return corrected;
}

function extractNumbers(text) {
    return (text.match(/-?\d+(\.\d+)?/g) || []).map(Number);
}

function formatFraction(numerator, denominator) {
    if (denominator === 0) return "Error: Division by zero";
    if (numerator === 0) return "0";

    numerator = parseFloat(numerator);
    denominator = parseFloat(denominator);

    if (numerator % denominator === 0) {
        return (numerator / denominator).toString();
    }

    const scaleFactor = 1000000;
    const numScaled = Math.round(numerator * scaleFactor);
    const denScaled = Math.round(denominator * scaleFactor);

    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    let common = gcd(Math.abs(numScaled), Math.abs(denScaled));

    let simplifiedNum = numScaled / common;
    let simplifiedDen = denScaled / common;

    if (simplifiedDen < 0) {
        simplifiedNum = -simplifiedNum;
        simplifiedDen = -simplifiedDen;
    }

    if (simplifiedDen === 1) {
        return simplifiedNum.toString();
    }

    return `\\frac{${simplifiedNum}}{${simplifiedDen}}`;
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

function calculateAverage(nums) {
    if (nums.length === 0) return 'N/A';
    const sum = nums.reduce((a, b) => a + b, 0);
    return (sum / nums.length).toFixed(2);
}

function calculateMedian(nums) {
    if (nums.length === 0) return 'N/A';
    const sorted = nums.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2) : sorted[mid].toFixed(2);
}

function calculateMode(nums) {
    if (nums.length === 0) return 'N/A';
    const freq = {};
    nums.forEach(num => freq[num] = (freq[num] || 0) + 1);
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(key => freq[key] === maxFreq).map(Number);
    return modes.length === 1 ? modes[0].toString() : modes.join(', ');
}

function calculateRange(nums) {
    if (nums.length === 0) return 'N/A';
    const sorted = nums.slice().sort((a, b) => a - b);
    return (sorted[sorted.length - 1] - sorted[0]).toFixed(2);
}

function calculateStandardDeviation(nums) {
    if (nums.length < 2) return 'Error: Need at least 2 numbers for standard deviation.';
    const n = nums.length;
    const mean = nums.reduce((sum, val) => sum + val, 0) / n;
    const squaredDifferencesSum = nums.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    const variance = squaredDifferencesSum / (n - 1);
    return Math.sqrt(variance).toFixed(4);
}

function calculateVariance(nums) {
    if (nums.length < 2) return 'Error: Need at least 2 numbers for variance.';
    const n = nums.length;
    const mean = nums.reduce((sum, val) => sum + val, 0) / n;
    const squaredDifferencesSum = nums.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    return (squaredDifferencesSum / (n - 1)).toFixed(4);
}

function calculateCombinations(n, k) {
    if (k < 0 || k > n) return 'Error: k must be between 0 and n.';
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return res;
}

function calculatePermutations(n, k) {
    if (k < 0 || k > n) return 'Error: k must be between 0 and n.';
    let res = 1;
    for (let i = 0; i < k; i++) {
        res *= (n - i);
    }
    return res;
}

function calculateDerivative(expression) {
    expression = expression.trim().toLowerCase();
    const powerMatch = expression.match(/^x\^(\d+)$/);
    if (powerMatch) {
        const n = parseInt(powerMatch[1]);
        if (n === 1) return '$1$';
        if (n === 0) return '$0$';
        return `$${n}x^{${n - 1}}$`;
    }
    if (expression === 'x') {
        return '$1$';
    }
    if (expression.includes('sin(x)')) {
        return '$\\cos(x)$';
    }
    if (expression.includes('cos(x)')) {
        return '$-\\sin(x)$';
    }
    if (expression.includes('e^x') || expression.includes('exp(x)')) {
        return '$e^x$';
    }
    if (expression.includes('ln(x)')) {
        return `$\\frac{1}{x}$`;
    }
    return 'Error: Only derivatives of x^n, sin(x), cos(x), e^x, and ln(x) are supported.';
}

function parseExpressionTerms(expression) {
    let a = 0;
    let b = 0;
    let c = 0;
    expression = expression.toLowerCase().replace(/\s/g, '');
    const terms = expression.match(/([+-]?[^+-]+)/g) || [];

    terms.forEach(term => {
        let currentSign = 1;
        let valStr = term;

        if (term.startsWith('-')) {
            currentSign = -1;
            valStr = term.substring(1);
        } else if (term.startsWith('+')) {
            valStr = term.substring(1);
        }

        let coefficient = 1;
        let parsedValue;

        const x2Match = valStr.match(/^(\d*\.?\d*(?:\/\d*\.?\d*)?)x\^2$/);
        if (x2Match) {
            const coeffPart = x2Match[1];
            if (coeffPart === '') coefficient = 1;
            else if (coeffPart.includes('/')) coefficient = parseFloat(coeffPart.split('/')[0]) / parseFloat(coeffPart.split('/')[1]);
            else coefficient = parseFloat(coeffPart);
            a += currentSign * coefficient;
            return;
        }

        const xMatch = valStr.match(/^(\d*\.?\d*(?:\/\d*\.?\d*)?)x$/);
        if (xMatch) {
            const coeffPart = xMatch[1];
            if (coeffPart === '') coefficient = 1;
            else if (coeffPart.includes('/')) coefficient = parseFloat(coeffPart.split('/')[0]) / parseFloat(coeffPart.split('/')[1]);
            else coefficient = parseFloat(coeffPart);
            b += currentSign * coefficient;
            return;
        }

        if (valStr.includes('/')) {
            const fracParts = valStr.split('/');
            parsedValue = parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
        } else {
            parsedValue = parseFloat(valStr);
        }
        c += currentSign * parsedValue;
    });
    return { a, b, c };
}

function solveLinearEquation(query) {
    const cleanedQuery = query.toLowerCase().replace(/^solve\s*/, '');
    const parts = cleanedQuery.split('=');

    if (parts.length !== 2) {
        return 'Error: Invalid linear equation format. Ensure there is one equals sign.';
    }

    const leftSideTerms = parseExpressionTerms(parts[0].trim());
    const rightSideTerms = parseExpressionTerms(parts[1].trim());

    const final_a = leftSideTerms.a - rightSideTerms.a;
    const final_b = leftSideTerms.b - rightSideTerms.b;
    const final_c = leftSideTerms.c - rightSideTerms.c;

    if (final_b === 0) {
        if (final_c === 0) {
            return 'Infinite solutions (e.g., $0 = 0$).';
        } else {
            return 'No solution (e.g., $0 = 5$).';
        }
    }

    const numerator = -final_c;
    const denominator = final_b;

    return `Solution: $x = ${formatFraction(numerator, denominator)}$`;
}

function solveQuadraticEquation(query) {
    const cleanedQuery = query.toLowerCase().replace(/^solve\s*/, '');
    const parts = cleanedQuery.split('=');

    if (parts.length !== 2) {
        return 'Error: Invalid quadratic equation format. Ensure there is one equals sign.';
    }

    const leftSideTerms = parseExpressionTerms(parts[0].trim());
    const rightSideTerms = parseExpressionTerms(parts[1].trim());

    const a = leftSideTerms.a - rightSideTerms.a;
    const b = leftSideTerms.b - rightSideTerms.b;
    const c = leftSideTerms.c - rightSideTerms.c;

    if (a === 0) {
        return solveLinearEquation(query);
    }

    const discriminant = b * b - 4 * a * c;

    if (discriminant >= 0) {
        const sqrtD = Math.sqrt(discriminant);
        const x1_num = -b + sqrtD;
        const x1_den = 2 * a;
        const x2_num = -b - sqrtD;
        const x2_den = 2 * a;

        const x1 = formatFraction(x1_num, x1_den);
        const x2 = formatFraction(x2_num, x2_den);

        if (Math.abs((x1_num / x1_den) - (x2_num / x2_den)) < 1e-9) {
            return `Solution: $x = ${x1}$`;
        } else {
            return `Solutions: $x_1 = ${x1}, x_2 = ${x2}$`;
        }
    } else {
        const sqrtNegD = Math.sqrt(Math.abs(discriminant));
        const realPartNum = -b;
        const realPartDen = 2 * a;
        const imagPartNum = sqrtNegD;
        const imagPartDen = 2 * a;

        const realPart = formatFraction(realPartNum, realPartDen);
        const imagPart = formatFraction(imagPartNum, imagPartDen);

        return `Solutions: $x_1 = ${realPart} + ${imagPart}i, x_2 = ${realPart} - ${imagPart}i$`;
    }
}

function evaluateFunction(query) {
    const match = query.match(/evaluate\s*([a-zA-Z]+\(x\)\s*=\s*)?(.+)\s*for\s*x\s*=\s*(-?\d+(\.\d+)?)/i);
    if (match) {
        let expression = match[2].trim();
        const xVal = parseFloat(match[3]);

        let result = expression.replace(/x/g, `(${xVal})`);

        try {
            const evaluatedResult = eval(result);
            return `Result: $${expression.replace(/x/g, xVal)} = ${evaluatedResult}$`;
        } catch (e) {
            console.error("Function evaluation error:", e);
            return 'Error: Could not evaluate the function. Please check the expression.';
        }<br>
        }
    return 'Error: Invalid function evaluation format. Try "evaluate x^2 + 3x for x = 5".';
}

function insertSymbol(symbol) {
    const textarea = document.getElementById('commandInput');
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        textarea.value = value.substring(0, start) + symbol + value.substring(end);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
    } else {
        console.error('insertSymbol: commandInput textarea not found');
    }
}

function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab');
    if (tabs.length > 0 && buttons.length > 0) {
        tabs.forEach(tab => tab.style.display = 'none');
        buttons.forEach(tab => tab.classList.remove('active'));
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.style.display = 'flex';
            const activeButton = document.querySelector(`.tab[onclick="openTab('${tabName}')"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            } else {
                console.warn(`openTab: Button for tab '${tabName}' not found.`);
            }
        } else {
            console.error(`openTab: Tab content with ID '${tabName}' not found.`);
        }
        if (tabName === 'history') updateHistory();
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([document.getElementById(tabName)]).catch((err) => console.error('MathJax typesetting error:', err));
        }
    } else {
        console.error('openTab: Tab elements not found (tabs or buttons).');
    }
}

// --- NEW UTILITY FUNCTION: appendResponse ---
function appendResponse(userQuery, smairtResponse, isMathJaxNeeded = true) {
    const outputDiv = document.getElementById('output');
    if (!outputDiv) {
        console.error('appendResponse: output div not found');
        return;
    }

    // Create a new paragraph for the user's query
    const userP = document.createElement('p');
    userP.classList.add('user-query');
    userP.textContent = `> ${userQuery}`;
    outputDiv.appendChild(userP);

    // Create a new paragraph for SMAIRT's response
    const smairtP = document.createElement('p');
    smairtP.classList.add('smairt-response');
    smairtP.innerHTML = smairtResponse; // Use innerHTML for MathJax to render

    outputDiv.appendChild(smairtP);

    // Scroll to the bottom
    outputDiv.scrollTop = outputDiv.scrollHeight;

    // Typeset with MathJax if needed
    if (isMathJaxNeeded && typeof MathJax !== 'undefined') {
        setTimeout(() => {
            MathJax.typesetPromise([smairtP]).catch((err) => console.error('MathJax typesetting error:', err));
        }, 10);
    } else if (isMathJaxNeeded) {
        console.warn('MathJax not loaded for typesetting.');
    }
}

// --- MODIFIED submitQuery FUNCTION ---
function submitQuery() {
    console.log('submitQuery function HAS BEEN CALLED.');
    const input = document.getElementById('commandInput');

    if (!input) {
        console.error('submitQuery: commandInput not found.');
        return;
    }

    let query = input.value.trim();
    console.log('Original Query received:', query);

    if (query) {
        const correctedQuery = correctSpelling(query);
        console.log('Corrected Query:', correctedQuery);
        const response = solveTextBasedMathQuery(correctedQuery);

        appendResponse(correctedQuery, response, true); // Always assume MathJax might be needed for a math query

        history.push({ query: correctedQuery, response });
        input.value = ''; // Clear input after submission
    } else {
        appendResponse('', 'Please enter a query.', false); // No MathJax for this simple message
        console.log('Empty query submitted.');
    }
}

function toggleStats() {
    const statsButtons = document.getElementById('statsButtons');
    const toggle = document.querySelector('.stats-toggle');
    if (statsButtons && toggle) {
        statsVisible = !statsVisible;
        statsButtons.style.display = statsVisible ? 'flex' : 'none';
        toggle.textContent = `▼ ${statsVisible ? 'Hide' : 'Statistical Tools'}`;
    } else {
        console.error('toggleStats: Stats buttons or toggle element not found.');
    }
}

// --- MODIFIED calculateStat FUNCTION ---
function calculateStat(statType) {
    const inputElement = document.getElementById('commandInput');
    if (!inputElement) {
        console.error('calculateStat: commandInput not found');
        return;
    }

    const input = inputElement.value.trim();
    const numbers = extractNumbers(input);
    let result = '';
    let isMathJaxNeeded = false; // By default, stats results aren't LaTeX

    if (numbers.length > 0) {
        switch (statType) {
            case 'average': result = `The average is ${calculateAverage(numbers)}.`; break;
            case 'mode': result = `The mode is ${calculateMode(numbers)}.`; break;
            case 'median': result = `The median is ${calculateMedian(numbers)}.`; break;
            case 'range': result = `The range is ${calculateRange(numbers)}.`; break;
            default: result = 'Unknown statistical operation. For advanced stats, type the query directly.'; break;
        }
        appendResponse(`${statType} of ${input}`, result, isMathJaxNeeded);
        history.push({ query: `${statType} of ${input}`, response: result });
        document.getElementById('commandInput').value = ''; // Clear input after stat calculation
    } else {
        appendResponse('', `Error: No numbers found in "${input}".`, false);
    }
}


function solveTextBasedMathQuery(query) {
    const lowerQuery = query.toLowerCase();
    const numbers = extractNumbers(query);
    let response = '';

    const hasX = lowerQuery.includes('x');
    const hasEquals = lowerQuery.includes('=');
    const looksLikeEquation = hasX && hasEquals;

    let processedQuery = lowerQuery;
    if (looksLikeEquation && !lowerQuery.startsWith('solve')) {
        processedQuery = 'solve ' + lowerQuery;
    }

    const derivativeMatch = processedQuery.match(/(?:d\/dx|derivative of)\s*(.+)/);
    if (derivativeMatch) {
        const expression = derivativeMatch[1].trim();
        response = `Derivative of $${expression}$: ${calculateDerivative(expression)}`;
        return response;
    }

    if (processedQuery.includes('solve') && processedQuery.includes('x^2')) {
        response = solveQuadraticEquation(processedQuery);
        return response;
    }

    if (processedQuery.includes('solve') && processedQuery.includes('x')) {
        response = solveLinearEquation(processedQuery);
        return response;
    }

    const evaluateMatch = processedQuery.match(/evaluate\s*([a-zA-Z]+\(x\)\s*=\s*)?(.+)\s*for\s*x\s*=\s*(-?\d+(\.\d+)?)/);
    if (evaluateMatch) {
        response = evaluateFunction(processedQuery);
        return response;
    }

    if (lowerQuery.includes('standard deviation of')) {
        if (numbers.length > 0) response = `The standard deviation is ${calculateStandardDeviation(numbers)}.`;
        else response = 'Error: No numbers provided for standard deviation.';
        return response;
    }
    if (lowerQuery.includes('variance of')) {
        if (numbers.length > 0) response = `The variance is ${calculateVariance(numbers)}.`;
        else response = 'Error: No numbers provided for variance.';
        return response;
    }
    const combinationsMatch = lowerQuery.match(/(?:combinations?)\s*(?:of)?\s*(\d+)\s*(?:choose)?\s*(\d+)/);
    if (combinationsMatch) {
        const n = parseInt(combinationsMatch[1]);
        const k = parseInt(combinationsMatch[2]);
        response = `Combinations of ${n} choose ${k}: ${calculateCombinations(n, k)}.`;
        return response;
    }
    const permutationsMatch = lowerQuery.match(/(?:permutations?)\s*(?:of)?\s*(\d+)\s*(?:choose)?\s*(\d+)/);
    if (permutationsMatch) {
        const n = parseInt(permutationsMatch[1]);
        const k = parseInt(permutationsMatch[2]);
        response = `Permutations of ${n} choose ${k}: ${calculatePermutations(n, k)}.`;
        return response;
    }

    if (query.match(/(\d+(\.\d+)?)\s*([+\-*/:])\s*(\d+(\.\d+)?)/)) {
        const match = query.match(/(\d+(\.\d+)?)\s*([+\-*/:])\s*(\d+(\.\d+)?)/);
        if (match) {
            const [_, num1, __, operator, num2] = match;
            const n1 = parseFloat(num1), n2 = parseFloat(num2);
            let result;
            switch (operator) {
                case '+': result = n1 + n2; break;
                case '-': result = n1 - n2; break;
                case '*': result = n1 * n2; break;
                case '/':
                case ':':
                    if (n2 !== 0) result = formatFraction(n1, n2);
                    else result = 'Error: Division by zero';
                    break;
                default: result = 'Error: Invalid arithmetic operation.'; break;
            }
            response = `Result: $${n1} ${operator === ':' ? '/' : operator} ${n2} = ${result}$`;
            return response;
        } else {
            response = 'Error: Could not parse arithmetic expression.';
            return response;
        }
    }

    if (lowerQuery.includes('biggest') || lowerQuery.includes('largest')) {
        if (lowerQuery.includes('two-digit')) {
            response = 'The largest two-digit number is 99.';
        } else if (lowerQuery.includes('three-digit')) {
            response = 'The largest three-digit number is 999.';
        } else if (numbers.length > 0) {
            response = `The largest number is ${Math.max(...numbers)}.`;
        } else {
            response = 'Please specify "two-digit" or "three-digit" or provide numbers.';
        }
        return response;
    }

    if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
        if (numbers.length > 0) response = `The average is ${calculateAverage(numbers)}.`;
        else response = 'Error: No numbers provided for average.';
        return response;
    } else if (lowerQuery.includes('median')) {
        if (numbers.length > 0) response = `The median is ${calculateMedian(numbers)}.`;
        else response = 'Error: No numbers provided for median.';
        return response;
    } else if (lowerQuery.includes('mode')) {
        if (numbers.length > 0) response = `The mode is ${calculateMode(numbers)}.`;
        else response = 'Error: No numbers provided for mode.';
        return response;
    } else if (lowerQuery.includes('range')) {
        if (numbers.length > 0) response = `The range is ${calculateRange(numbers)}.`;
        else response = 'Error: No numbers provided for range.';
        return response;
    }

    if (lowerQuery.includes('∫') || lowerQuery.includes('integrate')) {
        if ((lowerQuery.includes('sin(x)') && lowerQuery.includes('cos(x)')) && lowerQuery.includes('dx')) {
            response = '$\\int \\sin(x)\\cos(x) \\, dx = \\frac{1}{2}\\sin^2(x) + C$ (using u-substitution)';
        }
        else if (lowerQuery.includes('x^2 dx')) {
            response = '$\\int x^2 \\, dx = \\frac{1}{3}x^3 + C$';
        } else if (lowerQuery.includes('x dx')) {
            response = '$\\int x \\, dx = \\frac{1}{2}x^2 + C$';
        } else if (lowerQuery.includes('1/x dx')) {
            response = '$\\int \\frac{1}{x} \\, dx = \\ln|x| + C$';
        } else if (lowerQuery.includes('e^x dx')) {
            response = '$\\int e^x \\, dx = e^x + C$';
        } else if (lowerQuery.includes('sin(x) dx')) {
            response = '$\\int \\sin(x) \\, dx = -\\cos(x) + C$';
        } else if (lowerQuery.includes('cos(x) dx')) {
            response = '$\\int \\cos(x) \\, dx = \\sin(x) + C$';
        } else if (lowerQuery.includes('1 dx') || lowerQuery.includes('dx')) {
             response = '$\\int 1 \\, dx = x + C$';
        }
        else {
            response = 'Error: Specific integral forms are supported (e.g., $\\int x^2 \\, dx$, $\\int \\frac{1}{x} \\, dx$, $\\int \\sin(x) \\, dx$, $\\int \\sin(x)\\cos(x) \\, dx$), but this one is not yet.';
        }
        return response;
    }

    response = 'Sorry, I don’t recognize that command. Please check the "Help" tab for supported commands and examples.';
    return response;
}

// --- MODIFIED updateHistory FUNCTION ---
function updateHistory() {
    const historyDiv = document.getElementById('history-output');
    if (historyDiv) {
        historyDiv.innerHTML = ''; // Clear existing history

        if (history.length > 0) {
            history.forEach((entry, index) => {
                const p = document.createElement('p');
                p.innerHTML = `<strong>${index + 1}:</strong> ${entry.query}<br>Response: ${entry.response}`;
                historyDiv.appendChild(p);
            });
            if (typeof MathJax !== 'undefined') {
                MathJax.typesetPromise([historyDiv]).catch((err) => console.error('MathJax typesetting error:', err));
            }
        } else {
            historyDiv.innerHTML = '<p>No history.</p>';
        }
    } else {
        console.error('updateHistory: History output div not found.');
    }
}

// --- LOGIN MODAL FUNCTIONS ---
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active'); // Use class for opacity transition
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    } else {
        console.error('openLoginModal: loginModal not found');
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    } else {
        console.error('closeLoginModal: loginModal not found');
    }
}

function handleLoginSubmit(event) {
    event.preventDefault(); // Prevent default form submission
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const username = usernameInput.value;
    const password = passwordInput.value;

    // In a real application, you'd send these credentials to a server
    console.log('Attempting login with:');
    console.log('Username:', username);
    console.log('Password:', '*'.repeat(password.length)); // Don't log actual password

    // For now, just close the modal and provide a fake response
    closeLoginModal();
    appendResponse('Login Attempt', `Login successful! (This is a placeholder. User: ${username})`, false);

    // Clear the form fields
    usernameInput.value = '';
    passwordInput.value = '';
}


// --- MODIFIED DOMContentLoaded LISTENER ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('SMAIRT loaded');
    console.log('DOMContentLoaded fired.');

    if (typeof MathJax !== 'undefined' && MathJax.startup && MathJax.startup.promise) {
        MathJax.startup.promise.then(() => {
            console.log('MathJax is ready, opening initial tab.');
            openTab('problem-input');
        }).catch((err) => {
            console.error('Error waiting for MathJax startup promise:', err);
            openTab('problem-input');
        });
    } else {
        console.warn('MathJax object or startup promise not found. Opening tab without waiting for MathJax.');
        openTab('problem-input');
    }

    const commandInputTextarea = document.getElementById('commandInput');
    if (commandInputTextarea) {
        commandInputTextarea.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                console.log('Enter key pressed, calling submitQuery...');
                submitQuery();
            }
        });
        console.log('Event listener attached to commandInput for Enter key.');
    } else {
        console.error('commandInput textarea not found for keydown listener.');
    }

    const submitButton = document.getElementById('submitBtn');
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            console.log('Submit button clicked, calling submitQuery...');
            submitQuery();
        });
        console.log('Event listener attached to Submit button.');
    } else {
        console.error('Submit button with ID "submitBtn" not found to attach event listener.');
    }

    // --- Login Modal Event Listeners ---
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const loginForm = document.getElementById('loginForm');

    if (loginBtn) {
        loginBtn.addEventListener('click', openLoginModal);
        console.log('Event listener attached to Login button.');
    } else {
        console.error('Login button with ID "loginBtn" not found.');
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeLoginModal);
        console.log('Event listener attached to modal close button.');
    }

    if (loginModal) {
        // Close modal if user clicks outside the content
        loginModal.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                closeLoginModal();
            }
        });
        console.log('Event listener attached to modal overlay for closing.');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
        console.log('Event listener attached to login form submission.');
    } else {
        console.error('Login form with ID "loginForm" not found.');
    }
});
