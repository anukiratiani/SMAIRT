let history = [];

const spellCheckDict = {
    'appel': 'apple', 'appels': 'apples', 'giv': 'give', 'lef': 'left', 'tota': 'total',
    'totl': 'total', 'solv': 'solve', 'numer': 'number', 'equels': 'equals', 'prise': 'price',
    'bigest': 'biggest', 'maxium': 'maximum', 'pluss': 'plus', 'tree': 'three', 'fiv': 'five',
    'intergrate': 'integrate', 'sqr': 'sqrt', 'perimiter': 'perimeter', 'bace': 'base',
    '2digited': 'two-digit', 'digited': 'digit', 'two digited': 'two-digit'
};

function correctSpelling(text) {
    let corrected = text.toLowerCase();
    for (const [wrong, right] of Object.entries(spellCheckDict)) {
        corrected = corrected.replace(new RegExp(`\\b${wrong}\\b`, 'g'), right);
    }
    return corrected.replace(/\s+digited\b/g, '-digit');
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
        algebra: ['expand', 'factor', 'solve', 'equals', 'equation', 'quadratic', 'factorize'],
        calculus: ['integrate', 'differentiate', 'derivative', '∫'],
        logarithm: ['log', 'ln', 'lg'],
        squareRoot: ['sqrt', 'square root', '√'],
        base: ['base', 'convert'],
        perimeter: ['perimeter', 'circumference'],
        numberTheory: ['prime', 'factorize', 'divisors', 'gcd', 'lcm']
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
            response = `Result: ${num1} ${operator} ${num2} = ${result.toFixed(2)}`;
        } else {
            response = 'Error: Invalid arithmetic. Try "3 + 5".';
        }
    } else if (operation === 'descriptive') {
        if (lowerQuery.includes('biggest') || lowerQuery.includes('largest')) {
            if (lowerQuery.includes('two-digit')) {
                response = 'The largest two-digit number is 99.';
            } else if (lowerQuery.includes('three-digit')) {
                response = 'The largest three-digit number is 999.';
            } else {
                response = 'Specify "two-digit" or "three-digit" for the largest.';
            }
        } else if (lowerQuery.includes('smallest')) {
            if (lowerQuery.includes('two-digit')) {
                response = 'The smallest two-digit number is 10.';
            } else if (lowerQuery.includes('three-digit')) {
                response = 'The smallest three-digit number is 100.';
            } else {
                response = 'Specify "two-digit" or "three-digit" for the smallest.';
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
        } else if (lowerQuery.includes('factor') || lowerQuery.includes('factorize')) {
            const numMatch = numbers[0];
            if (numMatch) {
                const n = Math.floor(numMatch);
                const factors = factorize(n);
                response = `Factorization of ${n}: ${factors.map(f => f[1] > 1 ? `${f[0]}^${f[1]}` : f[0]).join(' × ')}`;
            } else {
                response = 'Error: Provide a number to factorize. Try "factorize 84".';
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
                    response += ` = ${F(b) - F(a).toFixed(2)} from ${a} to ${b}`;
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
    } else if (operation === 'numberTheory') {
        if (lowerQuery.includes('prime')) {
            const num = numbers[0];
            if (num) response = `${num} is ${isPrime(num) ? '' : 'not '}a prime number`;
            else response = 'Error: Provide a number. Try "is 17 prime".';
        } else if (lowerQuery.includes('factorize')) {
            const num = numbers[0];
            if (num) {
                const factors = factorize(num);
                response = `Factorization of ${num}: ${factors.map(f => f[1] > 1 ? `${f[0]}^${f[1]}` : f[0]).join(' × ')}`;
            } else {
                response = 'Error: Provide a number. Try "factorize 84".';
            }
        } else if (lowerQuery.includes('gcd')) {
            if (numbers.length >= 2) response = `GCD: ${gcd(...numbers)}`;
            else response = 'Error: Need two numbers. Try "gcd of 48 and 18".';
        } else if (lowerQuery.includes('lcm')) {
            if (numbers.length >= 2) response = `LCM: ${lcm(...numbers)}`;
            else response = 'Error: Need two numbers. Try "lcm of 12 and 18".';
        } else {
            response = 'Error: Unsupported number theory query.';
        }
    } else {
        response = 'Unknown command. Try "biggest two-digit number" or "factorize 84".';
    }

    return response;
}

function binomial(n, k) {
    if (k === 0 || k === n) return 1;
    return binomial(n - 1, k - 1) + binomial(n - 1, k);
}

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
}

function factorize(n) {
    let factors = [];
    let divisor = 2;
    while (n > 1) {
        let count = 0;
        while (n % divisor === 0) {
            count++;
            n /= divisor;
        }
        if (count > 0) factors.push([divisor, count]);
        divisor = divisor === 2 ? 3 : divisor + 2;
    }
    if (n > 1) factors.push([n, 1]);
    return factors;
}

function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
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
console.log('SMAIRT loaded with Grok 3 math');
