let history = [];

const spellCheckDict = {
    'appel': 'apple', 'appels': 'apples', 'giv': 'give', 'lef': 'left', 'tota': 'total',
    'totl': 'total', 'solv': 'solve', 'numer': 'number', 'equels': 'equals', 'prise': 'price',
    'bigest': 'biggest', 'maxium': 'maximum', 'pluss': 'plus', 'tree': 'three', 'fiv': 'five',
    'intergrate': 'integrate', 'sqr': 'sqrt', 'perimiter': 'perimeter', 'bace': 'base',
    '2digited': 'two-digit', 'digited': 'digit'
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
        const query = input.value.trim();
        if (query) {
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

document.getElementById('commandInput')?.addEventListener('keydown', function(event) {
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
        descriptive: ['biggest', 'largest', 'smallest', 'two-digit', 'three-digit'],
        wordProblem: ['left', 'remain', 'give', 'gives', 'cost', 'each', 'per', 'split'],
        algebra: ['expand', 'factor', 'solve', 'equals', 'equation', 'quadratic'],
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
            response = `Let's compute: ${num1} ${operator} ${num2} = ${result.toFixed(2)}`;
        } else {
            response = 'Error: Could not parse arithmetic query. Try "3 + 5".';
        }
    } else if (operation === 'descriptive') {
        if (lowerQuery.includes('biggest') || lowerQuery.includes('largest')) {
            if (lowerQuery.includes('two-digit')) {
                response = 'The largest two-digit number is 99.';
            } else if (lowerQuery.includes('three-digit')) {
                response = 'The largest three-digit number is 999.';
            } else {
                response = 'Specify "two-digit" or "three-digit" for the largest number.';
            }
        } else if (lowerQuery.includes('smallest')) {
            if (lowerQuery.includes('two-digit')) {
                response = 'The smallest two-digit number is 10.';
            } else if (lowerQuery.includes('three-digit')) {
                response = 'The smallest three-digit number is 100.';
            } else {
                response = 'Specify "two-digit" or "three-digit" for the smallest number.';
            }
        } else {
            response = 'Error: Could not parse descriptive query. Try "what's the biggest two-digit number".';
        }
    } else if (operation === 'wordProblem') {
        if (lowerQuery.includes('left') || lowerQuery.includes('remain')) {
            if (numbers.length >= 2) {
                response = `Remaining: ${numbers[0]} - ${numbers[1]} = ${numbers[0] - numbers[1]}`;
            } else {
                response = 'Error: Need at least two numbers.';
            }
        } else if (lowerQuery.includes('cost') || lowerQuery.includes('each')) {
            if (numbers.length >= 2) {
                response = `Total cost: ${numbers[0]} × ${numbers[1]} = ${numbers[0] * numbers[1]}`;
            } else {
                response = 'Error: Need at least two numbers.';
            }
        } else if (lowerQuery.includes('per') || lowerQuery.includes('split')) {
            if (numbers.length >= 2 && numbers[1] !== 0) {
                response = `Split: ${numbers[0]} ÷ ${numbers[1]} = ${(numbers[0] / numbers[1]).toFixed(2)}`;
            } else {
                response = 'Error: Insufficient numbers or division by zero.';
            }
        } else {
            response = 'Error: Could not parse word problem.';
        }
    } else if (operation === 'algebra') {
        if (lowerQuery.includes('solve') || lowerQuery.includes('equation')) {
            const quadMatch = query.match(/solve\s*x\^2\s*([+\-])\s*(\d+)\s*([+\-])\s*(\d+)\s*=?\s*0/i);
            if (quadMatch) {
                const sign1 = quadMatch[1], a = parseInt(quadMatch[2]), sign2 = quadMatch[3], c = parseInt(quadMatch[4]);
                const b = (sign1 === '-' ? -a : a) + (sign2 === '-' ? -c : c); // Simplified for x^2 + bx + c = 0
                const discriminant = b * b - 4 * 1 * c;
                if (discriminant >= 0) {
                    const sqrtD = Math.sqrt(discriminant);
                    const x1 = (-b + sqrtD) / 2;
                    const x2 = (-b - sqrtD) / 2;
                    response = `Solutions: x = ${x1.toFixed(2)}, x = ${x2.toFixed(2)}`;
                } else {
                    response = 'No real solutions (discriminant negative).';
                }
            } else {
                response = 'Error: Could not parse equation. Try "solve x^2 - 4 = 0".';
            }
        } else if (lowerQuery.includes('expand')) {
            const expandMatch = query.match(/expand\s*\(\s*(\w)\s*([+\-])\s*(\w)\s*\)\^(\d+)/i);
            if (expandMatch) {
                const a = expandMatch[1], op = expandMatch[2], b = expandMatch[3], n = parseInt(expandMatch[4]);
                const expandBinomial = (n, op) => {
                    let terms = [];
                    for (let i = 0; i <= n; i++) {
                        const coeff = binomial(n, i);
                        const powerA = n - i;
                        const powerB = i;
                        const sign = op === '+' ? '+' : (i % 2 === 0 ? '+' : '-');
                        terms.push(`${coeff}${a}^${powerA}${b}^${powerB}`);
                    }
                    return terms.join(' ').replace(/(\w)\^0/g, '').replace(/1(\w+)/g, '$1');
                };
                const binomial = (n, k) => {
                    if (k === 0 || k === n) return 1;
                    return binomial(n - 1, k - 1) + binomial(n - 1, k);
                };
                response = `Expanding (${a} ${op} ${b})^${n}: ${expandBinomial(n, op === '+' ? '+' : '-')}`;
            } else {
                response = 'Error: Could not parse expansion. Try "expand (a + b)^3".';
            }
        } else {
            response = 'Error: Unsupported algebra query. Try "solve x^2 - 4 = 0".';
        }
    } else if (operation === 'calculus') {
        if (lowerQuery.includes('integrate') || lowerQuery.includes('∫')) {
            const integralMatch = query.match(/(?:integrate|∫)\s*(\w*\^?\d*|\d+x|\w*)\s*(dx)?\s*(from\s*(\d+(\.\d+)?)\s*to\s*(\d+(\.\d+)?))?/i);
            if (integralMatch) {
                const expr = integralMatch[1].replace('x', '1*x');
                const hasLimits = integralMatch[3];
                const a = hasLimits ? parseFloat(integralMatch[4]) : null;
                const b = hasLimits ? parseFloat(integralMatch[6]) : null;
                let result;
                const polyMatch = expr.match(/(\d*\.?\d*)x\^(\d+)/i) || expr.match(/(\d+)/);
                if (polyMatch) {
                    const coeff = polyMatch[1] ? parseFloat(polyMatch[1]) : 1;
                    const power = polyMatch[2] ? parseInt(polyMatch[2]) : 0;
                    const newPower = power + 1;
                    const newCoeff = coeff / newPower;
                    result = `∫${expr} dx = ${newCoeff}x^${newPower}`;
                    if (hasLimits && a !== null && b !== null) {
                        const F = x => newCoeff * Math.pow(x, newPower);
                        const definite = F(b) - F(a);
                        result += `. From ${a} to ${b}: ${definite.toFixed(2)}`;
                    }
                } else if (expr.match(/sin/i)) {
                    result = `∫sin(x) dx = -cos(x) + C`;
                    if (hasLimits && a !== null && b !== null) {
                        const definite = -Math.cos(b) + Math.cos(a);
                        result += `. From ${a} to ${b}: ${definite.toFixed(2)}`;
                    }
                } else {
                    result = 'Error: Unsupported integral. Try "∫x^2 dx" or "∫sin(x) dx".';
                }
                response = result;
            } else {
                response = 'Error: Could not parse integral. Try "∫x^2 dx".';
            }
        } else if (lowerQuery.includes('differentiate')) {
            const derivMatch = query.match(/d\/dx\s*\(\s*(\d*\.?\d*)x\^(\d+)\s*\)/i);
            if (derivMatch) {
                const coeff = parseFloat(derivMatch[1]) || 1;
                const power = parseInt(derivMatch[2]);
                const newCoeff = coeff * power;
                const newPower = power - 1;
                response = `d/dx(${coeff}x^${power}) = ${newCoeff}x^${newPower}`;
            } else {
                response = 'Error: Could not parse derivative. Try "d/dx(2x^3)".';
            }
        }
    } else if (operation === 'logarithm') {
        const logMatch = query.match(/(log|ln|lg)\s*\(\s*(\d+(\.\d+)?)\s*\)/i);
        if (logMatch) {
            const type = logMatch[1].toLowerCase();
            const value = parseFloat(logMatch[2]);
            let result = type === 'ln' ? Math.log(value) : Math.log10(value);
            response = `${type.toUpperCase()}(${value}) = ${result.toFixed(4)}`;
        } else {
            response = 'Error: Could not parse logarithm. Try "ln(2)".';
        }
    } else if (operation === 'squareRoot') {
        const sqrtMatch = query.match(/(sqrt|√)\s*\(?\s*(\d+(\.\d+)?)\s*\)?/i);
        if (sqrtMatch) {
            const value = parseFloat(sqrtMatch[2]);
            response = `√${value} = ${Math.sqrt(value).toFixed(2)}`;
        } else {
            response = 'Error: Could not parse square root. Try "√16".';
        }
    } else if (operation === 'base') {
        const convertMatch = query.match(/convert\s*(\w+)\s*base\s*(\d+)\s*to\s*base\s*(\d+)/i);
        if (convertMatch) {
            const num = convertMatch[1], fromBase = parseInt(convertMatch[2]), toBase = parseInt(convertMatch[3]);
            try {
                const value = parseInt(num, fromBase);
                response = `${num} (base ${fromBase}) = ${value.toString(toBase)} (base ${toBase})`;
            } catch (e) {
                response = 'Error: Invalid number for specified base.';
            }
        } else {
            response = 'Error: Could not parse base conversion. Try "convert 1010 base 2 to base 10".';
        }
    } else if (operation === 'perimeter') {
        if (lowerQuery.includes('rectangle')) {
            const rectMatch = query.match(/rectangle\s*with\s*sides\s*(\d+(\.\d+)?)\s*and\s*(\d+(\.\d+)?)/i);
            if (rectMatch) {
                const side1 = parseFloat(rectMatch[1]), side2 = parseFloat(rectMatch[3]);
                response = `Perimeter: 2(${side1} + ${side2}) = ${(2 * (side1 + side2)).toFixed(2)}`;
            } else {
                response = 'Error: Specify two sides for rectangle.';
            }
        } else if (lowerQuery.includes('circle')) {
            const circleMatch = query.match(/circle\s*with\s*radius\s*(\d+(\.\d+)?)/i);
            if (circleMatch) {
                const radius = parseFloat(circleMatch[1]);
                response = `Circumference: 2π × ${radius} ≈ ${(2 * Math.PI * radius).toFixed(2)}`;
            } else {
                response = 'Error: Specify radius for circle.';
            }
        } else {
            response = 'Error: Could not parse perimeter. Try "perimeter of rectangle with sides 5 and 3".';
        }
    } else if (operation === 'olympiad') {
        if (lowerQuery.includes('perfect square')) {
            const match = query.match(/n\^2\s*\+\s*(\d+)n\s*\+\s*(\d+)/i);
            if (match) {
                const b = parseInt(match[1]), c = parseInt(match[2]);
                let solutions = [];
                for (let n = -100; n <= 100; n++) {
                    const val = n * n + b * n + c;
                    const sqrt = Math.sqrt(val);
                    if (Number.isInteger(sqrt)) solutions.push(n);
                }
                response = solutions.length ? `Solutions: n = ${solutions.join(', ')}` : 'No integer solutions in range [-100, 100].';
            } else {
                response = 'Error: Could not parse. Try "n^2 + 3n + 5 is a perfect square".';
            }
        } else {
            response = 'Error: Unsupported Olympiad query.';
        }
    } else {
        response = `Unknown command. Try "solve x^2 - 4 = 0" or "∫x^2 dx".`;
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
console.log('SMAIRT loaded');
