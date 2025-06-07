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
        corrected = corrected.replace(new RegExp(`\\b${wrong}\\b`, 'gi'), right);
    }
    return corrected.replace(/\s+digited/g, '-digit');
}

function extractNumbers(text) {
    return (text.match(/\d+(\.\d+)?/g) || []).map(Number);
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
    console.log('Query received:', query);

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
            default: result = 'Unknown statistical operation.'; break;
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
        else response = 'Error: No numbers provided.';
    } else if (query.match(/(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)/)) {
        const match = query.match(/(\d+(\.\d+)?)\s*([+\-*/])\s*(\d+(\.\d+)?)/);
        if (match) {
            const [_, num1, __, operator, num2] = match;
            const n1 = parseFloat(num1), n2 = parseFloat(num2);
            switch (operator) {
                case '+': response = `Result: ${n1} + ${n2} = ${n1 + n2}`; break;
                case '-': response = `Result: ${n1} - ${n2} = ${n1 - n2}`; break;
                case '*': response = `Result: ${n1} * ${n2} = ${n1 * n2}`; break;
                case '/': response = n2 !== 0 ? `Result: ${n1} / ${n2} = ${(n1 / n2).toFixed(2)}` : 'Error: Division by zero'; break;
                default: response = 'Error: Invalid arithmetic operation.';
            }
        } else {
            response = 'Error: Could not parse arithmetic expression.';
        }
    } else if (lowerQuery.includes('solve') && lowerQuery.includes('x^2')) {
        const constOnlyMatch = query.match(/x\^2\s*([+\-])\s*(\d+)\s*=\s*0/);
        if (constOnlyMatch) {
            const c = constOnlyMatch[1] === '-' ? -parseInt(constOnlyMatch[2]) : parseInt(constOnlyMatch[2]);
            if (-c >= 0) {
                const sqrtC = Math.sqrt(-c);
                response = `Solutions: x = ${sqrtC}, x = ${-sqrtC}`;
            } else {
                response = 'No real solutions.';
            }
        } else {
            response = 'Error: Invalid quadratic equation format. Try "solve x^2 - 4 = 0" or "solve x^2 + 9 = 0".';
        }
    } else if (lowerQuery.includes('∫') || lowerQuery.includes('integrate')) {
        // --- START ADVANCED INTEGRATION (specific pattern) ---
        // Recognize ∫sin(x)cos(x) dx using u-substitution
        if ((lowerQuery.includes('sin(x)') && lowerQuery.includes('cos(x)')) && lowerQuery.includes('dx')) {
            response = '∫sin(x)cos(x) dx = (sin(x))^2/2 + C (using u-substitution)';
        }
        // --- END ADVANCED INTEGRATION ---
        // Basic integral formulas (order matters - specific rules first)
        else if (lowerQuery.includes('x^2 dx')) {
            response = '∫x^2 dx = (x^3)/3 + C';
        } else if (lowerQuery.includes('x dx')) {
            response = '∫x dx = (x^2)/2 + C';
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
        // General error for unsupported forms
        else {
            response = 'Error: Specific integral forms are supported (e.g., ∫x^2 dx, ∫1/x dx, ∫sin(x) dx, ∫sin(x)cos(x) dx), but this one is not yet.';
        }
    } else {
        response = 'Sorry, I don’t recognize that command. Try "biggest two-digit number", "average of 4 and 6", or an integral like "∫x^2 dx".';
    }

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
