let history = [];

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).style.display = 'block';
    document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active');
    if (tabName === 'history') {
        updateHistory();
    }
}

document.getElementById('commandInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const input = event.target.value.trim();
        const outputDiv = document.getElementById('output');
        
        if (input) {
            outputDiv.innerHTML += `<p>> ${input}</p>`;
            const response = solveTextBasedMathQuery(input);
            outputDiv.innerHTML += `<p class="response">${response}</p>`;
            history.push({ query: input, response });
            event.target.value = '';
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }
    }
});

function solveTextBasedMathQuery(query) {
    const lowerQuery = query.toLowerCase();
    const numbers = query.match(/\d+(\.\d+)?/g)?.map(Number) || [];
    let response = '';

    if (lowerQuery.includes('how many') || lowerQuery.includes('left')) {
        if (lowerQuery.includes('give') || lowerQuery.includes('gives')) {
            if (numbers.length >= 2) {
                const initial = numbers[0];
                const given = numbers[1];
                const result = initial - given;
                response = `Solution: ${initial} - ${given} = ${result}`;
            } else {
                response = 'Error: Insufficient numbers found in the query.';
            }
        }
    } else if (lowerQuery.includes('sum') || lowerQuery.includes('total')) {
        if (numbers.length >= 2) {
            const sum = numbers.reduce((a, b) => a + b, 0);
            response = `Solution: Sum = ${sum}`;
        } else {
            response = 'Error: Insufficient numbers found in the query.';
        }
    } else if (lowerQuery.includes('solve') && lowerQuery.includes('=')) {
        const match = query.match(/x\s*([+\-*/])\s*(\d+(\.\d+)?)\s*=\s*(\d+(\.\d+)?)/);
        if (match) {
            const operator = match[1];
            const num1 = parseFloat(match[2]);
            const num2 = parseFloat(match[4]);
            let result;
            switch (operator) {
                case '+': result = num2 - num1; break;
                case '-': result = num2 + num1; break;
                case '*': result = num2 / num1; break;
                case '/': result = num2 * num1; break;
                default: result = null;
            }
            response = result !== null ? `Solution: x = ${result}` : 'Error: Invalid operation.';
        } else {
            response = 'Error: Could not parse equation.';
        }
    } else {
        response = `MathAI: Unrecognized query. Try a word problem or equation (e.g., "John has 5 apples and gives 2 to Mary, how many does he have left?" or "solve x + 5 = 10").`;
    }

    return response || 'MathAI: Please provide the mathematical logic for this query.';
}

function updateHistory() {
    const historyDiv = document.getElementById('history-output');
    historyDiv.innerHTML = history.length ? 
        history.map((entry, index) => `<p><strong>Query ${index + 1}:</strong> ${entry.query}<br><strong>Response:</strong> ${entry.response}</p>`).join('') :
        '<p>No history available.</p>';
}

// Initialize with Problem Input tab open
openTab('problem-input');