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
    for (const [wrong, right] of ObjectBTW.entries(spellCheckDict)) {
        corrected = corrected.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right);
    }
    return corrected.replace(/\s+digited/g, '-digit');
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
            const correctedQuery = correctSpelling(query);
            outputDiv.innerHTML += `<p>> ${correctedQuery}</p>`;
            const response = solveTextBasedMathQuery(correctedQuery);
            outputDiv.innerHTML += `<p class="response">${response}</p>`;
            history.push({ query: correctedQuery, response });
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

function solveTextBasedMathQuery(query) {
    const lowerQuery = query.toLowerCase();
    const numbers = extractNumbers(query);
    let response = '';

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
    } else if (lowerQuery.includes('average') || lowerQuery.includes('mean')) {
        if (numbers.length > 0) response = `The average is ${calculateAverage(numbers)}.`;
        else response = 'Error: No numbers provided.';
    } else if (lowerQuery.includes('median')) {
        if (numbers.length > 0) response = `The median is ${calculateMedian(numbers)}.`;
        else response = 'Error: No numbers provided.';
    } else if (lowerQuery.includes('mode')) {
        if (numbers.length > 0) response = `The mode is ${calculateMode(numbers)}.`;
        else response = 'Error: No numbers provided.';
    } else if (lowerQuery.includes('range')) {
        if (numbers.length > 0) response = `The range is ${calculateRange(numbers)}.`;
    } else if (query.match(/(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)/)) {
        const [_, num1, __, operator, num2] = query.match(/(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)/);
        const n1 = parseFloat(num1), n2 = parseFloat(num2);
        switch (operator) {
            case '+': response = `Result: ${n1} + ${n2} = ${n1 + n2}`; break;
            case '-': response = `Result: ${n1} - ${n2} = ${n1 - n2}`; break;
            case '*': response = `Result: ${n1} * ${n2} = ${n1 * n2}`; break;
            case '/': response = n2 !== 0 ? `Result: ${n1} / ${n2} = ${(n1 / n2).toFixed(2)}` : 'Error: Division by zero'; break;
        }
    } else if (lowerQuery.includes('solve') && lowerQuery.includes('x^2')) {
        const match = query.match(/x\^2\s*([+\-])\s*(\d+)\s*([+\-])\s*(\d+)/);
        if (match) {
            const b = match[1] === '-' ? -parseInt(match[2]) : parseInt(match[2]);
            const c = match[3] === '-' ? -parseInt(match[4]) : parseInt(match[4]);
            const discriminant = b * b - 4 * c;
            if (discriminant >= 0) {
                const sqrtD = Math.sqrt(discriminant);
                response = `Solutions: x = ${(-b + sqrtD) / 2}, x = ${(-b - sqrtD) / 2}`;
            } else {
                response = 'No real solutions.';
            }
        } else {
            response = 'Error: Invalid equation.';
        }
    } else if (lowerQuery.includes('∫') || lowerQuery.includes('integrate')) {
        if (lowerQuery.includes('x^2')) response = '∫x^2 dx = (x^3)/3 + C';
        else response = 'Error: Only ∫x^2 dx is supported for now.';
    } else {
        response = 'Sorry, I don’t recognize that command. Try "biggest two-digit number", "average of 4 and 6", or "∫x^2 dx".';
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

openTab('problem-input');
console.log('SMAIRT loaded');
