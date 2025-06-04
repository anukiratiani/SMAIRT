<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMAIRT - Smart Mathematics AI</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="header">SMAIRT: Smart Mathematics AI for Reasoning and Text</div>
        <div class="tabs">
            <button class="tab active" onclick="openTab('problem-input')">Problem Input</button>
            <button class="tab" onclick="openTab('history')">History</button>
            <button class="tab" onclick="openTab('help')">Help</button>
        </div>
        <div class="tab-content" id="problem-input">
            <div class="symbol-table">
                <button class="symbol-btn" onclick="insertSymbol('∫')">∫</button>
                <button class="symbol-btn" onclick="insertSymbol('^2')">^2</button>
                <button class="symbol-btn" onclick="insertSymbol('^')">^</button>
                <button class="symbol-btn" onclick="insertSymbol('√')">√</button>
                <button class="symbol-btn" onclick="insertSymbol('π')">π</button>
                <button class="symbol-btn" onclick="insertSymbol('log')">log</button>
                <button class="symbol-btn" onclick="insertSymbol('ln')">ln</button>
                <button class="symbol-btn" onclick="insertSymbol('lg')">lg</button>
                <button class="symbol-btn" onclick="insertSymbol('dx')">dx</button>
            </div>
            <div class="terminal">
                <div class="output" id="output"></div>
                <div class="input-line">
                    <span class="prompt">> </span>
                    <textarea id="commandInput" placeholder="Enter a mathematical query (e.g., 'biggest two digited number', 'average of 4 and 6', '∫x^2 dx')" autofocus></textarea>
                    <button class="submit-btn" onclick="submitQuery()">Submit</button>
                </div>
            </div>
        </div>
        <div class="tab-content" id="history" style="display: none;">
            <div class="history" id="history-output"></div>
        </div>
        <div class="tab-content" id="help" style="display: none;">
            <div class="help-content">
                <h2>Welcome to SMAIRT</h2>
                <p>SMAIRT solves advanced mathematical and statistical queries interactively.</p>
                <h3>How to Use</h3>
                <ul>
                    <li>Enter queries in the <strong>Problem Input</strong> tab (e.g., 'average of 4 and 6'), use symbols, then press <strong>Enter</strong> or click <strong>Submit</strong>.</li>
                    <li>Click symbols (∫, ^2, √, π, log, ln, lg, dx) to insert them.</li>
                    <li>View past queries in the <strong>History</strong> tab.</li>
                    <li>Use Shift+Enter for new lines.</li>
                </ul>
                <h3>Examples</h3>
                <ul>
                    <li>Descriptive: "biggest two digited number"</li>
                    <li>Statistics: "average of 4 and 6", "median of 1, 3, 5", "mode of 1, 2, 2, 3"</li>
                    <li>Algebra: "solve x^2 - 4 = 0"</li>
                    <li>Calculus: "∫x^2 dx"</li>
                </ul>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
