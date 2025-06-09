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
    'standard deviation': 'standard deviation', // Added for better phrase matching
    'std dev': 'standard deviation',
    'stddev': 'standard deviation',
    'comb': 'combinations',
    'perm': 'permutations',
    'variance': 'variance'
};

function correctSpelling(text) {
    let corrected = text.toLowerCase();
    // Sort keys by length in descending order to match longer phrases first
    const sortedKeys = Object.keys(spellCheckDict).sort((a, b) => b.length - a.length);

    for (const wrong of sortedKeys) {
        const right = spellCheckDict[wrong];
        // Use word boundaries for single words, but not for phrases like 'two digited'
        const regex = /\s/.test(wrong) ? new RegExp(wrong, 'gi') : new RegExp(`\\b${wrong}\\b`, 'gi');
        corrected = corrected.replace(regex, right);
    }
    return corrected;
}

function extractNumbers(text) {
    return (text.match(/-?\d+(\.\d+)?/g) || []).map(Number);
}

// Helper for displaying fractions beautifully
function formatFraction(numerator, denominator) {
    if (denominator === 0) return "Error: Division by zero";
    if (numerator === 0) return "0";
    
    // Simplification of fraction using GCD
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    let common = gcd(Math.abs(numerator), Math.abs(denominator));
    
    let simplifiedNum = numerator / common;
    let simplifiedDen = denominator / common;

    // Adjust sign if denominator is negative
    if (simplifiedDen < 0) {
        simplifiedNum = -simplifiedNum;
        simplifiedDen = -simplifiedDen;
    }

    // If it's a whole number, return as such
    if (simplifiedDen === 1) return simplifiedNum.toString();

    return `<span class="fraction-container">
                <span class="fraction-numerator">${simplifiedNum}</span>
                <span class="fraction-line"></span>
                <span class="fraction-denominator">${simplifiedDen}</span>
            </span>`;
}

// Factorial helper for combinations/permutations
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
    const variance = squaredDifferencesSum / (n - 1); // Sample standard deviation
    return Math.sqrt(variance).toFixed(4);
}

function calculateVariance(nums) {
    if (nums.length < 2) return 'Error: Need at least 2 numbers for variance.';
    const n = nums.length;
    const mean = nums.reduce((sum, val) => sum + val, 0) / n;
    const squaredDifferencesSum = nums.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    return (squaredDifferencesSum / (n - 1)).toFixed(4); // Sample variance
}

function calculateCombinations(n, k) {
    if (k < 0 || k > n) return 'Error: k must be between 0 and n.';
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k; // Optimization
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

    // d/dx x^n
    const powerMatch = expression.match(/^x\^(\d+)$/);
    if (powerMatch) {
        const n = parseInt(powerMatch[1]);
        if (n === 1) return '1';
        if (n === 0) return '0';
        return `${n}x^${n - 1}`;
    }
    // d/dx x
    if (expression === 'x') {
        return '1';
    }
    // d/dx sin(x)
    if (expression.includes('sin(x)')) {
        return 'cos(x)';
    }
    // d/dx cos(x)
    if (expression.includes('cos(x)')) {
        return '-sin(x)';
    }
    // d/dx e^x
    if (expression.includes('e^x') || expression.includes('exp(x)')) {
        return 'e^x';
    }
    // d/dx ln(x)
    if (expression.includes('ln(x)')) {
        return formatFraction(1, 'x');
    }

    return 'Error: Only derivatives of x^n, sin(x), cos(x), e^x, and ln(x) are supported.';
}

function solveLinearEquation(query) {
    // Expected formats: "solve ax + b = c", "solve ax = c", "solve ax + b = 0" etc.
    // Making coefficients optional for terms like "x" instead of "1x"
    // Regex: (sign? coefficient? x) (sign? constant) = (constant)
    const match = query.match(/solve\s*([-+]?\s*\d*\.?\d*)\s*x\s*([-+]?\s*\d*\.?\d*)?\s*=\s*([-+]?\s*\d*\.?\d*)/i);

    if (match) {
        let a = parseFloat(match[1].replace(/\s/g, '') || (match[1].includes('-') ? '-1' : '1'));
        if (isNaN(a)) a = 1; // Default to 1 if coefficient is just 'x' or '+x'
        if (match[1].trim() === '-') a = -1; // Specific for '-x'

        let b = parseFloat(match[2]?.replace(/\s/g, '')) || 0;
        let c = parseFloat(match[3].replace(/\s/g, '')) || 0;

        // Adjust b if it's part of the left side (ax + b) vs (ax - b)
        // match[2] captures " + 5" or " - 3" or ""
        const bSign = match[2]?.trim().charAt(0);
        if (bSign === '-') {
            b = -Math.abs(b); // Ensure 'b' takes its correct sign
        }

        // Equation is ax + b = c => ax = c - b => x = (c - b) / a
        const numerator = c - b;
        const denominator = a;

        if (denominator === 0) {
            if (numerator === 0) {
                return 'Infinite solutions (0 = 0).';
            } else {
                return 'No solution (e.g., 0 = 5).';
            }
        }
        return `Solution: x = ${formatFraction(numerator, denominator)}`;

    } else {
        return 'Error: Invalid linear equation format. Try "solve 2x + 5 = 15" or "solve 3x = 9".';
    }
}

function solveQuadraticEquation(query) {
    // Match ax^2 + bx + c = 0. Coefficients a, b, c can be implied 1, -1, or 0.
    // Handles forms like: "x^2+3x+2=0", "2x^2-x=0", "x^2-4=0", "-x^2+2x-1=0"
    const quadraticMatch = query.match(
        /solve\s*([-+]?\s*\d*\.?\d*)?\s*x\^2\s*([-+]?\s*\d*\.?\d*)?\s*x?\s*([-+]?\s*\d*\.?\d*)?\s*=\s*0/i
    );

    if (quadraticMatch) {
        let a = 0, b = 0, c = 0;

        // Parsing 'a' (coefficient of x^2)
        const aStr = quadraticMatch[1]?.replace(/\s/g, '').toLowerCase() || '';
        if (aStr === '' || aStr === '+') a = 1;
        else if (aStr === '-') a = -1;
        else a = parseFloat(aStr);
        if (isNaN(a)) a = 1; // Fallback for pure "x^2"


        // Parsing 'b' (coefficient of x)
        const bStr = quadraticMatch[2]?.replace(/\s/g, '').toLowerCase() || '';
        if (bStr.includes('x')) { // Means it's part of an 'x' term
            const val = bStr.replace('x', '');
            if (val === '' || val === '+') b = 1;
            else if (val === '-') b = -1;
            else b = parseFloat(val);
        } else if (bStr !== '') { // Could be a constant term if not followed by 'x'
             // If not an x term, it's c
             c = parseFloat(bStr);
        }

        // Parsing 'c' (constant term)
        const cStr = quadraticMatch[3]?.replace(/\s/g, '').toLowerCase() || '';
        if (cStr !== '') {
            c = parseFloat(cStr);
        }


        // Re-evaluate b and c based on common patterns after initial parse
        // This makes parsing more robust for various missing terms.
        const parts = query.toLowerCase().replace(/solve\s*/, '').replace(/=0/, '').split(/(\s*[-+]\s*)/).filter(Boolean);
        a = 0; b = 0; c = 0;
        let currentSign = 1;

        for (let i = 0; i < parts.length; i++) {
            let part = parts[i].trim();
            if (part === '+' || part === '-') {
                currentSign = (part === '+') ? 1 : -1;
                continue;
            }

            if (part.includes('x^2')) {
                const val = part.replace('x^2', '');
                a = (val === '' || val === '+') ? 1 : (val === '-' ? -1 : parseFloat(val));
                if (isNaN(a)) a = 1; // For cases like 'x^2'
                a *= currentSign;
            } else if (part.includes('x')) {
                const val = part.replace('x', '');
                b = (val === '' || val === '+') ? 1 : (val === '-' ? -1 : parseFloat(val));
                if (isNaN(b)) b = 1; // For cases like 'x'
                b *= currentSign;
            } else {
                c = parseFloat(part);
                c *= currentSign;
            }
            currentSign = 1; // Reset sign for next term
        }
        
        if (a === 0) {
            // If 'a' is 0, it's not a quadratic equation (it's linear or constant)
            return solveLinearEquation(query); // Delegate to linear solver
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

            if (x1 === x2) {
                return `Solution: x = ${x1}`;
            } else {
                return `Solutions: x₁ = ${x1}, x₂ = ${x2}`;
            }
        } else {
            // Complex solutions
            const sqrtNegD = Math.sqrt(Math.abs(discriminant));
            const realPartNum = -b;
            const realPartDen = 2 * a;
            const imagPartNum = sqrtNegD;
            const imagPartDen = 2 * a;

            const realPart = formatFraction(realPartNum, realPartDen);
            const imagPart = formatFraction(imagPartNum, imagPartDen);

            return `Solutions: x₁ = ${realPart} + ${imagPart}i, x₂ = ${realPart} - ${imagPart}i`;
        }
    } else {
        return 'Error: Invalid quadratic equation format. Try "solve x^2 - 4x + 4 = 0" or "solve 2x^2 + 8 = 0".';
    }
}


function evaluateFunction(query) {
    const match = query.match(/evaluate\s*([a-zA-Z]+\(x\)\s*=\s*)?(.+)\s*for\s*x\s*=\s*(-?\d+(\.\d+)?)/i);
    if (match) {
        let expression = match[2].trim();
        const xVal = parseFloat(match[3]);

        // Simple evaluation: replace 'x' with xVal
        // This is highly simplified and vulnerable to complex expressions
        // For security and robustness, real parsers use ASTs
        let result = expression.replace(/x/g, `(${xVal})`);

        try {
            // WARNING: Using eval() is generally unsafe for untrusted user input.
            // For a simple calculator like this, it might be acceptable, but be aware.
            // A robust solution would involve parsing the expression into an Abstract Syntax Tree (AST)
            // and evaluating it safely.
            const evaluatedResult = eval(result);
            return `Result: ${evaluatedResult}`;
        } catch (e) {
            console.error("Function evaluation error:", e);
            return 'Error: Could not evaluate the function. Please check the expression.';
        }
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
            selectedTab.style.display = 'block';
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
    } else {
        console.error('openTab: Tab elements not found (tabs or buttons).');
    }
}

function submitQuery() {
    console.log('submitQuery function called.');
    const input = document.getElementById('commandInput');
    const outputDiv = document.getElementById('output');

    if (!input || !outputDiv) {
        console.error('submitQuery: commandInput or output div not found. Input element:', input, 'Output div:', outputDiv);
        return;
    }

    let query = input.value.trim();
    console.log('Original Query received:', query);

    if (query) {
        const correctedQuery = correctSpelling(query);
        console.log('Corrected Query:', correctedQuery);
        outputDiv.innerHTML += `<p>> ${correctedQuery}</p>`;
        const response = solveTextBasedMathQuery(correctedQuery);
        outputDiv.innerHTML += `<p class="response">${response}</p>`;
        history.push({ query: correctedQuery, response });
        input.value = '';
        outputDiv.scrollTop = outputDiv.scrollHeight;
    } else {
        outputDiv.innerHTML += `<p class="response">Please enter a query.</p>`;
        outputDiv.scrollTop = outputDiv.scrollHeight;
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

function calculateStat(statType) {
    const inputElement = document.getElementById('commandInput');
    const outputDiv = document.getElementById('output');

    if (!inputElement || !outputDiv) {
        console.error('calculateStat: commandInput or output div not found');
        return;
    }

    const input = inputElement.value.trim();
    const numbers = extractNumbers(input);
    
    if (numbers.length > 0) {
        let result;
        switch (statType) {
            case 'average': result = `The average is ${calculateAverage(numbers)}.`; break;
            case 'mode': result = `The mode is ${calculateMode(numbers)}.`; break;
            case 'median': result = `The median is ${calculateMedian(numbers)}.`; break;
            case 'range': result = `The range is ${calculateRange(numbers)}.`; break;
            default: result = 'Unknown statistical operation. For advanced stats, type the query directly.'; break;
        }
        outputDiv.innerHTML += `<p>> ${statType} of ${input}</p>`;
        outputDiv.innerHTML += `<p class="response">${result}</p>`;
        history.push({ query: `${statType} of ${input}`, response: result });
        outputDiv.scrollTop = outputDiv.scrollHeight;
    } else {
        outputDiv.innerHTML += `<p class="response">Error: No numbers found in "${input}".</p>`;
    }
}

function solveTextBasedMathQuery(query) {
    const lowerQuery = query.toLowerCase();
    const numbers = extractNumbers(query);
    let response = '';

    // --- Order of checks matters: More specific patterns first ---

    // Derivatives
    const derivativeMatch = lowerQuery.match(/(?:d\/dx|derivative of)\s*(.+)/);
    if (derivativeMatch) {
        const expression = derivativeMatch[1].trim();
        response = `Derivative of ${expression}: ${calculateDerivative(expression)}`;
        return response;
    }

    // Linear Equation Solver (e.g., "solve 2x + 4 = 10")
    if (lowerQuery.startsWith('solve') && lowerQuery.includes('x') && !lowerQuery.includes('x^2')) {
        response = solveLinearEquation(lowerQuery);
        return response;
    }

    // Quadratic Equation Solver (e.g., "solve x^2 - 4x + 4 = 0")
    if (lowerQuery.includes('solve') && lowerQuery.includes('x^2')) {
        response = solveQuadraticEquation(lowerQuery);
        return response;
    }

    // Function Evaluation (e.g., "evaluate x^2 + 3x for x = 5")
    const evaluateMatch = lowerQuery.match(/evaluate\s*(.+)\s*for\s*x\s*=\s*(-?\d+(\.\d+)?)/);
    if (evaluateMatch) {
        response = evaluateFunction(lowerQuery);
        return response;
    }

    // Advanced Statistics - Standard Deviation
    if (lowerQuery.includes('standard deviation of')) {
        if (numbers.length > 0) response = `The standard deviation is ${calculateStandardDeviation(numbers)}.`;
        else response = 'Error: No numbers provided for standard deviation.';
        return response;
    }
    // Advanced Statistics - Variance
    if (lowerQuery.includes('variance of')) {
        if (numbers.length > 0) response = `The variance is ${calculateVariance(numbers)}.`;
        else response = 'Error: No numbers provided for variance.';
        return response;
    }
    // Advanced Statistics - Combinations
    const combinationsMatch = lowerQuery.match(/(?:combinations?)\s*(?:of)?\s*(\d+)\s*(?:choose)?\s*(\d+)/);
    if (combinationsMatch) {
        const n = parseInt(combinationsMatch[1]);
        const k = parseInt(combinationsMatch[2]);
        response = `Combinations of ${n} choose ${k}: ${calculateCombinations(n, k)}.`;
        return response;
    }
    // Advanced Statistics - Permutations
    const permutationsMatch = lowerQuery.match(/(?:permutations?)\s*(?:of)?\s*(\d+)\s*(?:choose)?\s*(\d+)/);
    if (permutationsMatch) {
        const n = parseInt(permutationsMatch[1]);
        const k = parseInt(permutationsMatch[2]);
        response = `Permutations of ${n} choose ${k}: ${calculatePermutations(n, k)}.`;
        return response;
    }

    // Basic Arithmetic Operations (e.g., "5 + 3")
    if (query.match(/(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)/)) {
        const match = query.match(/(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)/);
        if (match) {
            const [_, num1, __, operator, num2] = match;
            const n1 = parseFloat(num1), n2 = parseFloat(num2);
            let result;
            switch (operator) {
                case '+': result = n1 + n2; break;
                case '-': result = n1 - n2; break;
                case '*': result = n1 * n2; break;
                case '/': 
                    if (n2 !== 0) result = formatFraction(n1, n2);
                    else result = 'Error: Division by zero';
                    break;
                default: result = 'Error: Invalid arithmetic operation.'; break;
            }
            response = `Result: ${n1} ${operator} ${n2} = ${result}`;
            return response;
        } else {
            response = 'Error: Could not parse arithmetic expression.';
            return response;
        }
    }

    // Descriptive (e.g., "biggest two-digit number")
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
    
    // Basic Statistical Queries (e.g., "average of 4 and 6")
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

    // Integrals (e.g., "∫x^2 dx", "∫sin(x)cos(x) dx")
    if (lowerQuery.includes('∫') || lowerQuery.includes('integrate')) {
        // More advanced specific integral (u-substitution example)
        if ((lowerQuery.includes('sin(x)') && lowerQuery.includes('cos(x)')) && lowerQuery.includes('dx')) {
            response = '∫sin(x)cos(x) dx = ' + formatFraction(1,2) + '(sin(x))^2 + C (using u-substitution)';
        }
        // Basic integral formulas
        else if (lowerQuery.includes('x^2 dx')) {
            response = '∫x^2 dx = ' + formatFraction(1,3) + 'x^3 + C';
        } else if (lowerQuery.includes('x dx')) {
            response = '∫x dx = ' + formatFraction(1,2) + 'x^2 + C';
        } else if (lowerQuery.includes('1/x dx')) {
            response = '∫1/x dx = ln|x| + C';
        } else if (lowerQuery.includes('e^x dx')) {
            response = '∫e^x dx = e^x + C';
        } else if (lowerQuery.includes('sin(x) dx')) {
            response = '∫sin(x) dx = -cos(x) + C';
        } else if (lowerQuery.includes('cos(x) dx')) {
            response = '∫cos(x) dx = sin(x) + C';
        } else if (lowerQuery.includes('1 dx') || lowerQuery.includes('dx')) {
             response = '∫1 dx = x + C';
        }
        else {
            response = 'Error: Specific integral forms are supported (e.g., ∫x^2 dx, ∫1/x dx, ∫sin(x) dx, ∫sin(x)cos(x) dx), but this one is not yet.';
        }
        return response;
    }

    // Default Fallback
    response = 'Sorry, I don’t recognize that command. Please check the "Help" tab for supported commands and examples.';
    return response;
}

function updateHistory() {
    const historyDiv = document.getElementById('history-output');
    if (historyDiv) {
        historyDiv.innerHTML = history.length ? 
            history.map((entry, index) => `<p><strong>${index + 1}:</strong> ${entry.query}<br>Response: ${entry.response}</p>`).join('') :
            '<p>No history.</p>';
    } else {
        console.error('updateHistory: History output div not found.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    openTab('problem-input');
    console.log('SMAIRT loaded');

    const commandInputTextarea = document.getElementById('commandInput');
    if (commandInputTextarea) {
        commandInputTextarea.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitQuery();
            }
        });
        console.log('Event listener attached to commandInput for Enter key.');
    } else {
        console.error('commandInput textarea not found for keydown listener.');
    }

    const submitButton = document.getElementById('submitBtn');
    if (submitButton) {
        submitButton.addEventListener('click', submitQuery);
        console.log('Event listener attached to Submit button.');
    } else {
        console.error('Submit button with ID "submitBtn" not found to attach event listener.');
    }
});
