let history = [];

const spellCheckDict = {
    'appel': 'apple', 'appels': 'apples', 'giv': 'give', 'lef': 'left', 'tota': 'total',
    'totl': 'total', 'solv': 'solve', 'numer': 'number', 'equels': 'equals', 'prise': 'price',
    'bigest': 'biggest', 'maxium': 'maximum', 'pluss': 'plus', 'tree': 'three', 'fiv': 'five',
    'intergrate': 'integrate', 'sqr': 'sqrt', 'perimiter': 'perimeter', 'bace': 'base'
};

function correctSpelling(text) {
    let corrected = text.toLowerCase();
    for (const [wrong, right] of Object.entries(spellCheckDict)) {
        corrected = corrected.replace(new RegExp(`\\b${wrong}\\b`, 'g'), right);
    }
    return corrected;
}

function insertSymbol(symbol) {
    const textarea = document.getElementById('commandInput');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    textarea.value = value.substring(0, start) + symbol + value.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
}

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active');
    }
    if (tabName === 'history') updateHistory();
}

function submitQuery() {
    const input = document.getElementById('commandInput').value.trim();
    const outputDiv = document.getElementById('output');
    if (input) {
        outputDiv.innerHTML += `<p>> ${input}</p>`;
        const response = solveTextBasedMathQuery(input);
        outputDiv.innerHTML += `<p class="response">${response}</p>`;
        history.push({ query: input, response });
        document.getElementById('commandInput').value = '';
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }
}

document.getElementById('commandInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitQuery();
    }
});

function solveTextBasedMathQuery(query) {
    const correctedQuery = correctSpelling(query);
    const lowerQuery = correctedQuery.toLowerCase();
    const numbers = query.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    let response = '';

    const operations = {
        arithmetic: ['plus', 'minus', 'times', 'divided by', 'add', 'subtract', 'multiply', 'divide', 'what is', 'equals', '[+\\-*/]'],
        wordProblem: ['left', 'remain', 'give', 'gives', 'cost', 'each', 'per', 'split'],
        algebra: ['expand', 'factor', 'solve', 'equals', 'number', 'biggest', 'maximum'],
        calculus: ['integrate', 'differentiate', 'derivative', '∫'],
        logarithm: ['log', 'ln', 'lg'],
        squareRoot: ['sqrt', 'square root', '√'],
        base: ['base', 'convert'],
        perimeter: ['perimeter', 'circumference'],
        olympiad: ['find all', 'perfect square', 'integer']
    };

    const getOperation = () => {
        for (const [op, keywords] of Object.entries(operations)) {
            if (keywords.some(keyword => keyword.startsWith('[') ? query.match(new RegExp(keyword)) : lowerQuery.includes(keyword))) {
                return op;
            }
        }
        return null;
    };

    const operation = getOperation();

    if (operation === 'arithmetic' || query.match(/\d+\s*[+*\-/]\s*\d+/) || lowerQuery.includes('largest') || lowerQuery.includes('smallest')) {
        // Handle descriptive number phrases
        let num1, num2, operator;
        if (lowerQuery.includes('largest two digit number') && lowerQuery.includes('smallest two digit number')) {
            num1 = 99; // Largest two-digit number
            num2 = 10; // Smallest two-digit number
            operator = lowerQuery.includes('minus') ? '-' : null;
        } else {
            const arithmeticMatch = query.match(/(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)/);
            if (arithmeticMatch) {
                num1 = parseFloat(arithmeticMatch[1]);
                num2 = parseFloat(arithmeticMatch[4]);
                operator = arithmeticMatch[3];
            }
        }

        if (num1 !== undefined && num2 !== undefined && operator) {
            let result;
            switch (operator) {
                case '+': result = num1 + num2; break;
                case '-': result = num1 - num2; break;
                case '*': result = num1 * num2; break;
                case '/': result = num2 !== 0 ? num1 / num2 : 'Error: Division by zero'; break;
                default: result = null;
            }
            response = result !== null ? `Let's compute: ${num1} ${operator} ${num2} = ${typeof result === 'number' ? result.toFixed(2) : result}` : 'Error: Invalid arithmetic operation.';
        } else {
            response = 'Error: Could not parse arithmetic query. Try "3 + 5" or "largest two digit number minus smallest two digit number".';
        }
    } else if (operation === 'wordProblem') {
        if (lowerQuery.includes('left') || lowerQuery.includes('remain') || lowerQuery.includes('give') || lowerQuery.includes('gives')) {
            if (numbers.length >= 2) {
                const result = numbers[0] - numbers[1];
                response = `Subtracting: ${numbers[0]} - ${numbers[1]} = ${result}`;
            } else {
                response = 'Error: Need at least two numbers.';
            }
        } else if (lowerQuery.includes('cost') || lowerQuery.includes('each')) {
            if (numbers.length >= 2) {
                const result = numbers[0] * numbers[1];
                response = `Multiplying: ${numbers[0]} × ${numbers[1]} = ${result}`;
            } else {
                response = 'Error: Need at least two numbers.';
            }
        } else if (lowerQuery.includes('per') || lowerQuery.includes('split')) {
            if (numbers.length >= 2 && numbers[1] !== 0) {
                const result = numbers[0] / numbers[1];
                response = `Dividing: ${numbers[0]} ÷ ${numbers[1]} = ${result.toFixed(2)}`;
            } else {
                response = 'Error: Insufficient numbers or division by zero.';
            }
        } else {
            response = 'Error: Could not parse word problem.';
        }
    } else if (operation === 'algebra') {
        if (lowerQuery.includes('biggest') || lowerQuery.includes('maximum')) {
            if (numbers.length > 0) {
                const max = Math.max(...numbers);
                response = `The largest number is ${max}.`;
            } else {
                response = 'Error: No numbers found.';
            }
        } else if (lowerQuery.includes('expand')) {
            const expandMatch = query.match(/\((\w)\s*([+\-])\s*(\w)\)\^(\d)/i);
            if (expandMatch) {
                const a = expandMatch[1], op = expandMatch[2], b = expandMatch[3], n = parseInt(expandMatch[4]);
                if (n === 2) {
                    response = op === '+' ?
                        `Expanding (a + b)^2: a^2 + 2ab + b^2` :
                        `Expanding (a - b)^2: a^2 - 2ab + b^2`;
                } else if (n === 3) {
                    response = op === '+' ?
                        `Expanding (a + b)^3: a^3 + 3a^2b + 3ab^2 + b^3` :
                        `Expanding (a - b)^3: a^3 - 3a^2b + 3ab^2 - b^3`;
                } else if (n === 4) {
                    response = op === '+' ?
                        `Expanding (a + b)^4: a^4 + 4a^3b + 6a^2b^2 + 4ab^3 + b^4` :
                        `Expanding (a - b)^4: a^4 - 4a^3b + 6a^2b^2 - 4ab^3 + b^4`;
                } else {
                    response = 'Error: Expansion supported for powers 2, 3, or 4 only.';
                }
            } else if (lowerQuery.match(/\(a\s*\+\s*b\s*\+\s*c\)\^2/i)) {
                response = `Expanding (a + b + c)^2: a^2 + b^2 + c^2 + 2ab + 2bc + 2ca`;
            } else if (lowerQuery.match(/\(a\s*-\s*b\s*-\s*c\)\^2/i)) {
                response = `Expanding (a - b - c)^2: a^2 + b^2 + c^2 - 2ab + 2bc - 2ca`;
            } else {
                response = 'Error: Could not parse expansion query.';
            }
        } else if (lowerQuery.includes('factor')) {
            const factorMatch = query.match(/(\w)\^3\s*([+\-])\s*(\w)\^3/i);
            if (factorMatch) {
                const a = factorMatch[1], op = factorMatch[2], b = factorMatch[3];
                if (op === '-') {
                    response = `Factorizing a^3 - b^3: (a - b)(a^2 + ab + b^2)`;
                } else {
                    response = `Factorizing a^3 + b^3: (a + b)(a^2 - ab + b^2)`;
                }
            } else if (lowerQuery.match(/a\^4\s*-\s*b\^4/i)) {
                response = `Factorizing a^4 - b^4: (a - b)(a + b)(a^2 + b^2)`;
            } else if (lowerQuery.match(/a\^2\s*-\s*b\^2/i)) {
                response = `Factorizing a^2 - b^2: (a - b)(a + b)`;
            } else {
                response = 'Error: Could not parse factorization query.';
            }
        } else if (lowerQuery.includes('power rule')) {
            const powerMatch = query.match(/(\w)\^(\d+)\s*(\w)\^(\d+)/i);
            if (powerMatch) {
                const base1 = powerMatch[1], exp1 = parseInt(powerMatch[2]), base2 = powerMatch[3], exp2 = parseInt(powerMatch[4]);
                if (base1 === base2) {
                    response = `Applying (a^m)(a^n) = a^(m+n): ${base1}^${exp1 + exp2}`;
                } else {
                    response = `Applying (ab)^m = a^m b^m: (${base1}${base2})^${exp1} = ${base1}^${exp1}${base2}^${exp1}`;
                }
            } else if (query.match(/\((\w+\^\d+)\)\^\d+/i)) {
                const nestedPowerMatch = query.match(/\((\w+)\^(\d+)\)\^(\d+)/i);
                if (nestedPowerMatch) {
                    const base = nestedPowerMatch[1], m = parseInt(nestedPowerMatch[2]), n = parseInt(nestedPowerMatch[3]);
                    response = `Applying (a^m)^n = a^(m*n): ${base}^${m * n}`;
                } else {
                    response = 'Error: Could not parse power rule query.';
                }
            } else {
                response = 'Error: Invalid power rule query.';
            }
        } else {
            const linearPattern = /(number|what)\s*(plus|minus|times|divided by)\s*(\d+(\.\d+)?)\s*(equals|is)\s*(\d+(\.\d+)?)/i;
            const match = query.match(linearPattern);
            if (match) {
                const op = match[2].toLowerCase(), num1 = parseFloat(match[3]), num2 = parseFloat(match[6]);
                let result;
                switch (op) {
                    case 'plus': result = num2 - num1; break;
                    case 'minus': result = num2 + num1; break;
                    case 'times': result = num2 / num1; break;
                    case 'divided by': result = num2 * num1; break;
                    default: result = null;
                }
                response = result !== null ? `Solving: The number is ${result}` : 'Error: Invalid algebraic operation.';
            } else {
                response = 'Error: Could not parse algebraic query. Try "expand (a + b)^2" or "factor a^3 - b^3".';
            }
        }
    } else if (operation === 'calculus') {
        if (lowerQuery.includes('integrate') || lowerQuery.includes('∫')) {
            const integralMatch = query.match(/(?:integrate|∫)\s*(\w*\^?\d*|\d+|\w*)\s*(dx)?\s*(from\s*(\d+(\.\d+)?)\s*to\s*(\d+(\.\d+)?))?/i);
            if (integralMatch) {
                const expr = integralMatch[1];
                const hasLimits = integralMatch[3];
                const a = hasLimits ? parseFloat(integralMatch[4]) : null;
                const b = hasLimits ? parseFloat(integralMatch[6]) : null;
                let result;
                let polyMatch = expr.match(/x\^(\d+)/i);
                if (polyMatch) {
                    const power = parseInt(polyMatch[1]);
                    const newPower = power + 1;
                    const coefficient = 1 / newPower;
                    result = `Let’s integrate: ∫${expr} dx = ${coefficient}x^${newPower}`;
                    if (hasLimits && a !== null && b !== null) {
                        const F = x => (coefficient * Math.pow(x, newPower));
                        const definite = F(b) - F(a);
                        result += `. For limits [${a}, ${b}]: ${definite.toFixed(2)}`;
                    }
                } else if (expr.match(/^\d+$/)) {
                    const constant = parseFloat(expr);
                    result = `Integrating constant: ∫${constant} dx = ${constant}x`;
                    if (hasLimits && a !== null && b !== null) {
                        const F = x => constant * x;
                        const definite = F(b) - F(a);
                        result += `. For limits [${a}, ${b}]: ${definite.toFixed(2)}`;
                    }
                } else if (expr.match(/sin/i)) {
                    result = `Integrating: ∫sin(x) dx = -cos(x)`;
                    if (hasLimits && a !== null && b !== null) {
                        const F = x => -Math.cos(x);
                        const definite = F(b) - F(a);
                        result += `. For limits [${a}, ${b}]: ${definite.toFixed(2)}`;
                    }
                } else {
                    result = 'Error: Unsupported integral. Try polynomials or sin(x).';
                }
                response = result;
            } else {
                response = 'Error: Could not parse integral query. Try "∫x^2 dx".';
            }
        } else if (lowerQuery.includes('differentiate') || lowerQuery.includes('derivative')) {
            const polyMatch = query.match(/x\^(\d+)/i);
            if (polyMatch) {
                const power = parseInt(polyMatch[1]);
                const coefficient = power;
                const newPower = power - 1;
                response = `Differentiating: d/dx(x^${power}) = ${coefficient}x^${newPower}`;
            } else {
                response = 'Error: Could not parse differentiation query.';
            }
        }
    } else if (operation === 'logarithm') {
        const logMatch = query.match(/(log|ln|lg)\s*\(\s*(\d+(\.\d+)?)\s*\)/i);
        if (logMatch) {
            const type = logMatch[1].toLowerCase();
            const value = parseFloat(logMatch[2]);
            let result;
            if (type === 'ln') {
                result = Math.log(value);
                response = `Computing: ln(${value}) = ${result.toFixed(4)}`;
            } else if (type === 'lg') {
                result = Math.log10(value);
                response = `Computing: lg(${value}) = ${result.toFixed(4)}`;
            } else if (type === 'log') {
                result = Math.log10(value);
                response = `Computing: log(${value}) = ${result.toFixed(4)}`;
            }
        } else {
            response = 'Error: Could not parse logarithm query. Try "ln(2)".';
        }
    } else if (operation === 'squareRoot') {
        const sqrtMatch = query.match(/(sqrt|√)\s*\(?\s*(\d+(\.\d+)?)\s*\)?/i);
        if (sqrtMatch) {
            const value = parseFloat(sqrtMatch[2]);
            const result = Math.sqrt(value);
            response = `Computing: √${value} = ${result.toFixed(2)}`;
        } else {
            response = 'Error: Could not parse square root query. Try "√16".';
        }
    } else if (operation === 'base') {
        const convertMatch = query.match(/convert\s*(\w+)\s*base\s*(\d+)\s*to\s*base\s*(\d+)/i);
        if (convertMatch) {
            const num = convertMatch[1], fromBase = parseInt(convertMatch[2]), toBase = parseInt(convertMatch[3]);
            try {
                const value = parseInt(num, fromBase);
                response = `Converting ${num} from base ${fromBase} to base ${toBase}: ${value.toString(toBase)}`;
            } catch (e) {
                response = 'Error: Invalid number for specified base.';
            }
        } else {
            const arithmeticMatch = query.match(/(\w+)\s*([+\-*/])\s*(\w+)\s*base\s*(\d+)/i);
            if (arithmeticMatch) {
                const num1 = arithmeticMatch[1], operator = arithmeticMatch[2], num2 = arithmeticMatch[3], base = parseInt(arithmeticMatch[4]);
                try {
                    const v1 = parseInt(num1, base), v2 = parseInt(num2, base);
                    let result;
                    switch (operator) {
                        case '+': result = v1 + v2; break;
                        case '-': result = v1 - v2; break;
                        case '*': result = v1 * v2; break;
                        case '/': result = v2 !== 0 ? v1 / v2 : 'Error: Division by zero'; break;
                        default: result = null;
                    }
                    response = result !== null ? `Computing in base ${base}: ${num1} ${operator} ${num2} = ${typeof result === 'number' ? result.toString(base) : result}` : 'Error: Invalid operation.';
                } catch (e) {
                    response = 'Error: Invalid numbers for specified base.';
                }
            } else {
                response = 'Error: Could not parse base query. Try "convert 1010 base 2 to base 10".';
            }
        }
    } else if (operation === 'perimeter') {
        if (lowerQuery.includes('rectangle')) {
            const rectMatch = query.match(/rectangle\s*with\s*sides\s*(\d+(\.\d+)?)\s*and\s*(\d+(\.\d+)?)/i);
            if (rectMatch) {
                const side1 = parseFloat(rectMatch[1]), side2 = parseFloat(rectMatch[3]);
                const perimeter = 2 * (side1 + side2);
                response = `Perimeter of rectangle: 2(${side1} + ${side2}) = ${perimeter.toFixed(2)}`;
            } else {
                response = 'Error: Specify two sides for rectangle.';
            }
        } else if (lowerQuery.includes('circle') || lowerQuery.includes('circumference')) {
            const circleMatch = query.match(/circle\s*with\s*radius\s*(\d+(\.\d+)?)/i);
            if (circleMatch) {
                const radius = parseFloat(circleMatch[1]);
                const perimeter = 2 * Math.PI * radius;
                response = `Circumference of circle: 2π × ${radius} ≈ ${perimeter.toFixed(2)}`;
            } else {
                response = 'Error: Specify radius for circle.';
            }
        } else {
            response = 'Error: Could not parse perimeter query. Try "perimeter of rectangle with sides 5 and 3".';
        }
    } else if (operation === 'olympiad') {
        if (lowerQuery.includes('perfect square')) {
            const olympiadMatch = query.match(/n\^2\s*\+\s*(\d+)n\s*\+\s*(\d+)\s*is\s*a\s*perfect\s*square/i);
            if (olympiadMatch) {
                const b = parseInt(olympiadMatch[1]), c = parseInt(olympiadMatch[2]);
                let solutions = [];
                for (let n = -100; n <= 100; n++) {
                    const value = n * n + b * n + c;
                    const sqrt = Math.sqrt(value);
                    if (Number.isInteger(sqrt)) {
                        solutions.push(n);
                    }
                }
                response = solutions.length ?
                    `Let’s find integers n such that n^2 + ${b}n + ${c} is a perfect square. Solutions: n = ${solutions.join(', ')}` :
                    `No integer solutions found for n^2 + ${b}n + ${c} being a perfect square in range [-100, 100].`;
            } else {
                response = 'Error: Could not parse Olympiad query. Try "find integers n such that n^2 + 3n + 5 is a perfect square".';
            }
        } else {
            response = 'Error: Unsupported Olympiad problem. Please specify a perfect square condition.';
        }
    } else {
        response = `Sorry, I don’t recognize that command. Try something like "expand (a + b)^2", "∫x^2 dx", or "perimeter of a rectangle with sides 5 and 3".`;
    }

    return response;
}

function updateHistory() {
    const historyDiv = document.getElementById('history-output');
    historyDiv.innerHTML = history.length ? 
        history.map((entry, index) => `<p><strong>Query ${index + 1}:</strong> ${entry.query}<br><strong>Response:</strong> ${entry.response}</p>`).join('') :
        '<p>No history available.</p>';
}

// Initialize
openTab('problem-input');
