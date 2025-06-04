let history = [];
let statsVisible = false;

const spellCheckDict = {
    'appel': 'apple', 'appels': 'apples', 'giv': 'give', 'lef': 'left', 'tota': 'total',
    'totl': 'total', 'solv': 'solve', 'numer': 'number', 'equels': 'equals', 'prise': 'price',
    'bigest': 'biggest', 'maxium': 'maximum', 'pluss': 'plus', 'tree': 'three', 'fiv': 'five',
    'intergrate': 'integrate', 'sqr': 'sqrt', 'perimiter': 'perimeter', 'bace': 'base',
    'two digited': 'two-digit', 'digited': 'digit', 'avrg': 'average', 'meen': 'mean',
    'mediam': 'median', 'mod': 'mode', 'rang': 'range', 'avrge': 'average', 'medn': 'median',
    'modde': 'mode', 'ranj': 'range'
};

function correctSpelling(text) {
    let corrected = text.toLowerCase();
    for (const [wrong, right] of Object.entries(spellCheckDict)) {
        corrected = corrected.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right); // Case-insensitive
    }
    return corrected.replace(/\s+digited/g, '-digit');
}

function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // Deletion
                matrix[j - 1][i] + 1, // Insertion
                matrix[j - 1][i - 1] + indicator // Substitution
            );
        }
    }
    return matrix[b.length][a.length];
}

function findClosestMatch(word, dictionary) {
    const threshold = 2; // Allow up to 2 edits
    let bestMatch = word;
    let minDistance = threshold + 1;
    for (const key of Object.keys(dictionary)) {
        const distance = levenshteinDistance(word, key);
        if (distance <= threshold && distance < minDistance) {
            minDistance = distance;
            bestMatch = dictionary[key];
        }
    }
    return bestMatch;
}

function extractNumbers(text) {
    return (text.match(/\d+(\.\d+)?/g) || []).map(Number);
}

function calculateAverage(nums) {
    const sum = nums.reduce((a, b) => a + b, 0);
    return (sum / nums.length).toFixed(2);
}

function calculateMedian(nums) {
    const sorted = nums.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2) : sorted[mid].toFixed(2);
}

function calculateMode(nums) {
    const freq = {};
    nums.forEach(num => freq[num] = (freq[num] || 0) + 1);
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(key => freq[key] === maxFreq).map(Number);
    return modes.length === 1 ? modes[0].toString() : modes.join(', ');
}

function calculateRange(nums) {
    const sorted = nums.slice().sort((a, b) => a - b);
    return (sorted[sorted.length - 1] - sorted[0]).toFixed(2);
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
        console.error('commandInput textarea not found');
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
            document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active');
        }
        if (tabName === 'history') updateHistory();
    } else {
        console.error('Tab elements not found');
    }
}

function submitQuery() {
    const input = document.getElementById('commandInput');
    const outputDiv = document.getElementById('output');
    if (input && outputDiv) {
        let query = input.value.trim();
        if (query) {
            // Enhanced spelling correction with Levenshtein distance
            const words = query.split(/\s+/);
            query = words.map(word => {
                const corrected = correctSpelling(word);
                return corrected === word ? findClosestMatch(word, spellCheckDict) : corrected;
            }).join(' ');
            outputDiv.innerHTML += `<p>> ${query}</p>`;
            const response = solveTextBasedMathQuery(query);
            outputDiv.innerHTML += `<p class="response">${response}</p>`;
            history.push({ query, response });
            input.value = '';
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }
    } else {
        console.error('commandInput or output div not found');
    }
}

function toggleStats() {
    const statsButtons = document.getElementById('statsButtons');
    const toggle = document.querySelector('.stats-toggle');
    statsVisible = !statsVisible;
    statsButtons.style.display = statsVisible ? 'flex' : 'none';
    toggle.textContent = `▼ ${statsVisible ? 'Hide' : 'Statistical Tools'}`;
}

function calculateStat(statType) {
    const input = document.getElementById('commandInput').value.trim();
    const numbers = extractNumbers(input);
    const outputDiv = document.getElementById('output');
    if (numbers.length > 0) {
        let result;
        switch (statType) {
            case 'average': result = `The average is ${calculateAverage(numbers)}.`; break;
            case 'mode': result = `The mode is ${calculateMode(numbers)}.`; break;
            case 'median': result = `The median is ${calculateMedian(numbers)}.`; break;
            case 'range': result = `The range is ${calculateRange(numbers)}.`; break;
        }
        if (outputDiv) {
            outputDiv.innerHTML += `<p>> ${statType} of ${input}</p>`;
            outputDiv.innerHTML += `<p class="response">${result}</p>`;
            history.push({ query: `${statType} of ${input}`, response: result });
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }
    } else {
        if (outputDiv) outputDiv.innerHTML += `<p class="response">Error: No numbers found in "${input}".</p>`;
    }
}

document.getElementById('commandInput')?.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitQuery();
    }
});

function binomial(n, k) {
    if (k === 0 || k === n) return 1;
    return binomial(n - 1, k - 1) + binomial(n - 1, k);
}

function solveTextBasedMathQuery(query) {
    const correctedQuery = correctSpelling(query);
    const lowerQuery = correctedQuery.toLowerCase();
    const numbers = extractNumbers(query);
    let response = '';

    const operations = {
        arithmetic: ['plus', 'minus', 'times', 'divided by', 'add', 'subtract', 'multiply', 'divide', 'what is', 'equals', '[+\\-*/]'],
        descriptive: ['biggest', 'largest', 'smallest', 'two-digit', 'three-digit'],
        wordProblem: ['left', 'remain', 'give', 'gives', 'cost', 'each', 'per', 'split'],
        algebra: ['expand', 'factor', 'solve', 'equals', 'equation', 'quadratic'],
        calculus: ['integrate', 'differentiate', 'derivative', '∫'],
        logarithm: ['log', 'ln', 'lg'],
        squareRoot: ['sqrt', 'square root', '√'],
        base: ['base', 'convert'],
        perimeter: ['perimeter', 'circumference'],
        statistics: ['average', 'mean', 'median', 'mode', 'range']
    };

    const getOperation = () => {
        for (const [opType, keywords] of Object.entries(operations)) {
            if (keywords.some(keyword => keyword.startsWith('[') ? query.match(new RegExp(keyword)) : lowerQuery.includes(keyword))) {
                return opType;
            }
        }
        return null;
    };

    const operation = getOperation();

    if (operation === 'arithmetic' || query.match(/\d+\s*[+*\-/]\s*\d+/)) {
        const arithmeticMatch = query.match(/(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)/);
        if (arithmeticMatch) {
            const num1 = parseFloat(arithmeticMatch[1]);
            const num2 = parseFloat(arithmeticMatch[4]);
            const operator = arithmeticMatch[3];
            let result;
            switch (operator) {
                case '+': result = num1 + num2; break;
                case '-': result = num1 - num2; break;
                case '*': result = num1 * num2; break;
                case '/': result = num2 !== 0 ? num1 / num2 : 'Error: Division by zero'; break;
            }
            response = `Result: ${num1} ${operator} ${num2} = ${result.toFixed(2)}`;
        } else {
            response = 'Error: Invalid arithmetic. Try "3 + 5".';
        }
    } else if (operation === 'descriptive') {
        if ((lowerQuery.includes('biggest') || lowerQuery.includes('largest')) && numbers.length === 0) {
            if (lowerQuery.includes('two-digit')) {
                response = 'The largest two-digit number is 99.';
            } else if (lowerQuery.includes('three-digit')) {
                response = 'The largest three-digit number is 999.';
            } else {
                response = 'Please specify "two-digit" or "three-digit".';
            }
        } else if (lowerQuery.includes('smallest') && numbers.length === 0) {
            if (lowerQuery.includes('two-digit')) {
                response = 'The smallest two-digit number is 10.';
            } else if (lowerQuery.includes('three-digit')) {
                response = 'The smallest three-digit number is 100.';
            } else {
                response = 'Please specify "two-digit" or "three-digit".';
            }
        } else {
            response = 'Error: Unrecognized descriptive query. Try "biggest two-digit number".';
        }
    } else if (operation === 'wordProblem') {
        if (lowerQuery.includes('left') || lowerQuery.includes('remain')) {
            if (numbers.length >= 2) response = `Remaining: ${numbers[0]} - ${numbers[1]} = ${numbers[0] - numbers[1]}`;
            else response = 'Error: Need two numbers.';
        } else if (lowerQuery.includes('cost') || lowerQuery.includes('each')) {
            if (numbers.length >= 2) response = `Total: ${numbers[0]} × ${numbers[1]} = ${numbers[0] * numbers[1]}`;
            else response = 'Error: Need two numbers.';
        } else if (lowerQuery.includes('per') || lowerQuery.includes('split')) {
            if (numbers.length >= 2 && numbers[1] !== 0) response = `Split: ${numbers[0]} ÷ ${numbers[1]} = ${(numbers[0] / numbers[1]).toFixed(2)}`;
            else response = 'Error: Invalid split.';
        } else {
            response = 'Error: Unrecognized word problem.';
        }
    } else if (operation === 'algebra') {
        if (lowerQuery.includes('solve') || lowerQuery.includes('equation')) {
            const quadMatch = query.match(/solve\s*x\^2\s*([+\-])\s*(\d+)\s*([+\-])\s*(\d+)\s*=?\s*0/i);
            if (quadMatch) {
                const a = 1, b = (quadMatch[1] === '-' ? -parseInt(quadMatch[2]) : parseInt(quadMatch[2]));
                const c = (quadMatch[3] === '-' ? -parseInt(quadMatch[4]) : parseInt(quadMatch[4]));
                const discriminant = b * b - 4 * a * c;
                if (discriminant >= 0) {
                    const sqrtD = Math.sqrt(discriminant);
                    const x1 = (-b + sqrtD) / (2 * a);
                    const x2 = (-b - sqrtD) / (2 * a);
                    response = `Solutions: x = ${x1.toFixed(2)}, x = ${x2.toFixed(2)}`;
                } else {
                    response = 'No real solutions.';
                }
            } else {
                response = 'Error: Invalid equation. Try "solve x^2 - 4 = 0".';
            }
        } else if (lowerQuery.includes('expand')) {
            const expandMatch = query.match(/expand\s*\(\s*(\w)\s*([+\-])\s*(\w)\s*\)\^(\d+)/i);
            if (expandMatch) {
                const a = expandMatch[1], op = expandMatch[2], b = expandMatch[3], n = parseInt(expandMatch[4]);
                let terms = [];
                for (let i = 0; i <= n; i++) {
                    const coeff = binomial(n, i);
                    const powerA = n - i;
                    const powerB = i;
                    const sign = op === '+' || (op === '-' && i % 2 === 0) ? '+' : '-';
                    terms.push(`${coeff}${a}^${powerA}${b}^${powerB}`);
                }
                response = `Expansion: (${a} ${op} ${b})^${n} = ${terms.join(' ').replace(/(\w)\^0/g, '').replace(/1(\w+)/g, '$1')}`;
            } else {
                response = 'Error: Invalid expansion. Try "expand (a + b)^3".';
            }
        } else {
            response = 'Error: Unsupported algebra query.';
        }
    } else if (operation === 'calculus') {
        if (lowerQuery.includes('integrate') || lowerQuery.includes('∫')) {
            const integralMatch = query.match(/(?:integrate|∫)\s*(\d*\.?\d*x\^?\d*|\w*)\s*(dx)?\s*(from\s*(\d+(\.\d+)?)\s*to\s*(\d+(\.\d+)?))?/i);
            if (integralMatch) {
                const expr = integralMatch[1].replace('x', '1*x');
                const hasLimits = integralMatch[3];
                const a = hasLimits ? parseFloat(integralMatch[4]) : null;
                const b = hasLimits ? parseFloat(integralMatch[6]) : null;
                const polyMatch = expr.match(/(\d*\.?\d*)x\^(\d+)/i) || [null, 1, 0];
                const coeff = parseFloat(polyMatch[1]) || 1;
                const power = parseInt(polyMatch[2]) || 0;
                const newPower = power + 1;
                const newCoeff = coeff / newPower;
                response = `∫${expr} dx = ${newCoeff}x^${newPower} + C`;
                if (hasLimits && a !== null && b !== null) {
                    const F = x => newCoeff * Math.pow(x, newPower);
                    response += ` = ${(F(b) - F(a)).toFixed(2)} from ${a} to ${b}`;
                }
            } else {
                response = 'Error: Invalid integral. Try "∫x^2 dx".';
            }
        } else if (lowerQuery.includes('differentiate')) {
            const derivMatch = query.match(/d\/dx\s*\(\s*(\d*\.?\d*)x\^(\d+)\s*\)/i);
            if (derivMatch) {
                const coeff = parseFloat(derivMatch[1]) || 1;
                const power = parseInt(derivMatch[2]);
                response = `d/dx(${coeff}x^${power}) = ${coeff * power}x^${power - 1}`;
            } else {
                response = 'Error: Invalid derivative. Try "d/dx(2x^3)".';
            }
        }
    } else if (operation === 'logarithm') {
        const logMatch = query.match(/(log|ln|lg)\s*\(\s*(\d+(\.\d+)?)\s*\)/i);
        if (logMatch) {
            const type = logMatch[1].toLowerCase();
            const value = parseFloat(logMatch[2]);
            response = `${type.toUpperCase()}(${value}) = ${type === 'ln' ? Math.log(value) : Math.log10(value).toFixed(4)}`;
        } else {
            response = 'Error: Invalid logarithm. Try "ln(2)".';
        }
    } else if (operation === 'squareRoot') {
        const sqrtMatch = query.match(/(sqrt|√)\s*\(?\s*(\d+(\.\d+)?)\s*\)?/i);
        if (sqrtMatch) {
            const value = parseFloat(sqrtMatch[2]);
            response = `√${value} = ${Math.sqrt(value).toFixed(2)}`;
        } else {
            response = 'Error: Invalid square root. Try "√16".';
        }
    } else if (operation === 'base') {
        const convertMatch = query.match(/convert\s*(\w+)\s*base\s*(\d+)\s*to\s*base\s*(\d+)/i);
        if (convertMatch) {
            const num = convertMatch[1], fromBase = parseInt(convertMatch[2]), toBase = parseInt(convertMatch[3]);
            try {
                response = `${num} (base ${fromBase}) = ${parseInt(num, fromBase).toString(toBase)} (base ${toBase})`;
            } catch (e) {
                response = 'Error: Invalid base conversion.';
            }
        } else {
            response = 'Error: Invalid base query. Try "convert 1010 base 2 to base 10".';
        }
    } else if (operation === 'perimeter') {
        if (lowerQuery.includes('rectangle')) {
            const rectMatch = query.match(/rectangle\s*with\s*sides\s*(\d+(\.\d+)?)\s*and\s*(\d+(\.\d+)?)/i);
            if (rectMatch) {
                const side1 = parseFloat(rectMatch[1]), side2 = parseFloat(rectMatch[3]);
                response = `Perimeter: 2(${side1} + ${side2}) = ${(2 * (side1 + side2)).toFixed(2)}`;
            } else {
                response = 'Error: Specify two sides.';
            }
        } else if (lowerQuery.includes('circle')) {
            const circleMatch = query.match(/circle\s*with\s*radius\s*(\d+(\.\d+)?)/i);
            if (circleMatch) {
                const radius = parseFloat(circleMatch[1]);
                response = `Circumference: 2π × ${radius} ≈ ${(2 * Math.PI * radius).toFixed(2)}`;
            } else {
                response = 'Error: Specify radius.';
            }
        } else {
            response = 'Error: Invalid perimeter query.';
        }
    } else if (operation === 'statistics') {
        if (numbers.length > 0) {
            if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
                response = `The average is ${calculateAverage(numbers)}.`;
            } else if (lowerQuery.includes('median')) {
                response = `The median is ${calculateMedian(numbers)}.`;
            } else if (lowerQuery.includes('mode')) {
                response = `The mode is ${calculateMode(numbers)}.`;
            } else if (lowerQuery.includes('range')) {
                response = `The range is ${calculateRange(numbers)}.`;
            }
        } else {
            response = 'Error: No numbers provided for statistical calculation.';
        }
    } else {
        response = `Sorry, I don’t recognize that command. Try "biggest two-digit number", "avrge of 4 and 6", "∫x^2 dx", or use the statistical buttons.`;
    }

    return response;
}

function updateHistory() {
    const historyDiv = document.getElementById('history-output');
    if (historyDiv) {
        historyDiv.innerHTML = history.length ? 
            history.map((entry, index) => `<p><strong>${index + 1}:</strong> ${entry.query}<br>${entry.response}</p>`).join('') :
            '<p>No history.</p>';
    }
}

// Initialize
openTab('problem-input');
console.log('SMAIRT loaded with advanced stats and smart recognition');
