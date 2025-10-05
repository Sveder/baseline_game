let gameFeatures = [];
let currentQuestionIndex = 0;
let score = 0;
let gameQuestions = [];
let answers = [];
let currentGameMode = 'baseline';

// Statistics tracking
let stats = {
    high: { correct: 0, total: 0 },
    low: { correct: 0, total: 0 },
    unknown: { correct: 0, total: 0 }
};

// Load game data
async function loadGameData() {
    try {
        const response = await fetch('/static/game/data/game-features.json');
        gameFeatures = await response.json();
        console.log(`Loaded ${gameFeatures.length} features`);
    } catch (error) {
        console.error('Error loading game data:', error);
        alert('Error loading game data. Please refresh the page.');
    }
}

// Game mode selection
function selectGameMode(mode) {
    currentGameMode = mode;
    if (mode === 'mixed') {
        startMixedGame();
    }
}

// Helper function to extract Chrome version number from supportInfo
function getChromeVersion(feature) {
    if (!feature.supportInfo) return null;

    const chromeMatch = feature.supportInfo.match(/chrome:\s*(\d+)/);
    if (chromeMatch) {
        const version = parseInt(chromeMatch[1]);
        // Filter out invalid version numbers
        if (version >= 900) return null;
        return version;
    }
    return null;
}

// Helper function to safely escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start the game
function startGame() {
    if (gameFeatures.length === 0) {
        alert('Game data not loaded yet. Please wait and try again.');
        return;
    }

    // Reset game state
    currentQuestionIndex = 0;
    score = 0;
    answers = [];
    stats = {
        high: { correct: 0, total: 0 },
        low: { correct: 0, total: 0 },
        unknown: { correct: 0, total: 0 }
    };

    // Select 10 random questions
    const shuffled = [...gameFeatures].sort(() => Math.random() - 0.5);
    gameQuestions = shuffled.slice(0, 10);

    // Show question area
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('question-area').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    // Load first question
    loadQuestion();
}

// Load current question
function loadQuestion() {
    const question = gameQuestions[currentQuestionIndex];

    // Update progress
    const progress = ((currentQuestionIndex) / gameQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    // Update score display
    document.getElementById('current-score').textContent = score;
    document.getElementById('total-questions').textContent = gameQuestions.length;

    // Update question content
    document.getElementById('feature-name').textContent = question.name;
    document.getElementById('feature-description').textContent = question.description;

    // Reset options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
        option.onclick = () => selectOption(option);
    });

    // Reset feedback and next button
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('next-btn').classList.remove('show');

    // Update stats tracking
    stats[question.status].total++;
}

// Handle option selection
function selectOption(selectedOption) {
    const question = gameQuestions[currentQuestionIndex];
    const selectedAnswer = selectedOption.dataset.answer;
    const correctAnswer = question.status;

    // Disable further selections
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.onclick = null;
    });

    // Mark selected option
    selectedOption.classList.add('selected');

    // Show correct/incorrect status
    const isCorrect = selectedAnswer === correctAnswer;
    if (isCorrect) {
        selectedOption.classList.add('correct');
        score++;
        stats[correctAnswer].correct++;
    } else {
        selectedOption.classList.add('incorrect');
        // Show correct answer
        options.forEach(option => {
            if (option.dataset.answer === correctAnswer) {
                option.classList.add('correct');
            }
        });
    }

    // Store answer
    answers.push({
        question: question,
        selected: selectedAnswer,
        correct: correctAnswer,
        isCorrect: isCorrect
    });

    // Show feedback
    showFeedback(question, isCorrect, selectedAnswer, correctAnswer);

    // Show next button
    document.getElementById('next-btn').classList.add('show');
}

// Show feedback for the answer (legacy function - kept for compatibility)
function showFeedback(question, isCorrect, selectedAnswer, correctAnswer) {
    const feedback = document.getElementById('feedback');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackText = document.getElementById('feedback-text');

    // Create MDN search link
    const mdnSearchUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(question.name)}`;
    const mdnLink = `<br><small><a href="${mdnSearchUrl}" target="_blank" rel="noopener noreferrer">Learn more on MDN →</a></small>`;

    if (isCorrect) {
        feedback.className = 'feedback show correct';
        feedbackTitle.textContent = '✅ Correct!';
        feedbackText.innerHTML = `You correctly identified that <strong>${escapeHtml(question.name)}</strong> has <strong>${escapeHtml(getStatusLabel(correctAnswer))}</strong> status.${mdnLink}`;
    } else {
        feedback.className = 'feedback show incorrect';
        feedbackTitle.textContent = '❌ Incorrect';
        feedbackText.innerHTML = `<strong>${escapeHtml(question.name)}</strong> actually has <strong>${escapeHtml(getStatusLabel(correctAnswer))}</strong> status, not ${escapeHtml(getStatusLabel(selectedAnswer))}.`;

        // Add support info if available
        if (question.supportInfo) {
            feedbackText.innerHTML += `<br><small><strong>Browser support:</strong> ${escapeHtml(question.supportInfo)}</small>`;
        }

        feedbackText.innerHTML += mdnLink;
    }
}

// Get human-readable status label
function getStatusLabel(status) {
    switch (status) {
        case 'high': return 'Baseline Widely Available';
        case 'low': return 'Baseline Newly Available';
        case 'unknown': return 'Unknown/Limited Support';
        default: return 'Unknown';
    }
}

// Move to next question
function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < gameQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// Show final results
function showResults() {
    document.getElementById('question-area').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    // Calculate and display results
    const accuracy = Math.round((score / gameQuestions.length) * 100);

    document.getElementById('final-score').textContent = `${score}/${gameQuestions.length}`;
    document.getElementById('accuracy').textContent = `${accuracy}%`;

    // Generate answers summary
    const summaryDiv = document.getElementById('answers-summary');
    let summaryHTML = '<h3 style="color: #16a34a; margin-bottom: 20px;">Your Answers:</h3>';

    answers.forEach((answer, index) => {
        const icon = answer.isCorrect ? '✅' : '❌';
        const statusClass = answer.isCorrect ? 'correct' : 'incorrect';
        const mdnSearchUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(answer.question.name)}`;

        summaryHTML += `
            <div style="background: ${answer.isCorrect ? '#f0fff4' : '#fdf2f2'};
                        border: 2px solid ${answer.isCorrect ? '#38a169' : '#e53e3e'};
                        border-radius: 10px;
                        padding: 15px;
                        margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <strong>${icon} Question ${index + 1}: ${escapeHtml(answer.question.name)}</strong>
                        <p style="margin: 8px 0; color: #666; font-size: 0.9em;">${escapeHtml(answer.question.description)}</p>
                        <p style="margin: 8px 0; font-size: 0.9em;">
                            <strong>Correct answer:</strong> ${escapeHtml(getStatusLabel(answer.correct))}
                            ${!answer.isCorrect ? `<br><strong>Your answer:</strong> ${escapeHtml(getStatusLabel(answer.selected))}` : ''}
                        </p>
                    </div>
                </div>
                <a href="${mdnSearchUrl}" target="_blank" rel="noopener noreferrer"
                   style="display: inline-block; margin-top: 10px; color: #16a34a; text-decoration: none; font-size: 0.9em;">
                    📚 Learn more on MDN →
                </a>
            </div>
        `;
    });

    summaryDiv.innerHTML = summaryHTML;
}

// Reset game
function resetGame() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('mixed-question-area').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}

// Start the mixed game mode
function startMixedGame() {
    if (gameFeatures.length === 0) {
        alert('Game data not loaded yet. Please wait and try again.');
        return;
    }

    currentQuestionIndex = 0;
    score = 0;
    answers = [];
    stats = {
        high: { correct: 0, total: 0 },
        low: { correct: 0, total: 0 },
        unknown: { correct: 0, total: 0 }
    };

    generateMixedQuestions();

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('mixed-question-area').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    loadMixedQuestion();
}

// Generate mixed questions
function generateMixedQuestions() {
    gameQuestions = [];
    const shuffled = [...gameFeatures].sort(() => Math.random() - 0.5);

    // Create pool of comparison questions
    const comparisonPool = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
        const featureA = shuffled[i];
        const featureB = shuffled[i + 1];

        const versionA = getChromeVersion(featureA);
        const versionB = getChromeVersion(featureB);

        if (versionA !== null && versionB !== null && versionA !== versionB) {
            comparisonPool.push({
                type: 'comparison',
                featureA: featureA,
                featureB: featureB,
                correctAnswer: versionA > versionB ? 'a' : 'b'
            });
        }
    }

    // Create pool of baseline questions
    const baselinePool = shuffled.map(feature => ({
        type: 'baseline',
        feature: feature,
        correctAnswer: feature.status
    }));

    // Mix questions: roughly 50/50 split
    for (let i = 0; i < 10; i++) {
        if (i % 2 === 0 && comparisonPool.length > 0) {
            // Add comparison question
            const randomIndex = Math.floor(Math.random() * comparisonPool.length);
            gameQuestions.push(comparisonPool.splice(randomIndex, 1)[0]);
        } else if (baselinePool.length > 0) {
            // Add baseline question
            const randomIndex = Math.floor(Math.random() * baselinePool.length);
            gameQuestions.push(baselinePool.splice(randomIndex, 1)[0]);
        }
    }

    // Fill remaining slots if needed
    while (gameQuestions.length < 10) {
        if (comparisonPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * comparisonPool.length);
            gameQuestions.push(comparisonPool.splice(randomIndex, 1)[0]);
        } else if (baselinePool.length > 0) {
            const randomIndex = Math.floor(Math.random() * baselinePool.length);
            gameQuestions.push(baselinePool.splice(randomIndex, 1)[0]);
        } else {
            break;
        }
    }
}

// Load current mixed question
function loadMixedQuestion() {
    const question = gameQuestions[currentQuestionIndex];

    const progress = (currentQuestionIndex / gameQuestions.length) * 100;
    const progressBar = document.getElementById('mixed-progress-bar');
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${currentQuestionIndex + 1}/${gameQuestions.length}`;

    document.getElementById('mixed-current-score').textContent = score;
    document.getElementById('mixed-total-questions').textContent = gameQuestions.length;

    // Hide both question types initially
    document.getElementById('baseline-question-content').style.display = 'none';
    document.getElementById('comparison-question-content').style.display = 'none';

    if (question.type === 'baseline') {
        loadBaselineQuestion(question);
    } else if (question.type === 'comparison') {
        loadComparisonQuestion(question);
    }

    document.getElementById('mixed-feedback').classList.remove('show');
    document.getElementById('mixed-next-btn').classList.remove('show');
}

function loadBaselineQuestion(question) {
    document.getElementById('mixed-question-title').textContent = 'What is the baseline support status for this feature?';
    document.getElementById('baseline-question-content').style.display = 'block';

    // Use textContent to safely set feature name and description (already safe)
    document.getElementById('baseline-feature-name').textContent = question.feature.name;
    document.getElementById('baseline-feature-description').textContent = question.feature.description;

    const options = document.querySelectorAll('#baseline-options .option');
    options.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
        option.onclick = () => selectMixedAnswer(option.dataset.answer);
    });

    // Update stats tracking
    stats[question.feature.status].total++;
}

function loadComparisonQuestion(question) {
    document.getElementById('mixed-question-title').innerHTML = 'Which web feature was released <span style="color: #dc2626; font-weight: bold;">more recently</span>?';
    document.getElementById('comparison-question-content').style.display = 'block';

    // Use textContent to safely set feature names and descriptions (already safe)
    document.querySelector('#mixed-feature-a .feature-name').textContent = question.featureA.name;
    document.querySelector('#mixed-feature-a .feature-description').textContent = question.featureA.description;

    document.querySelector('#mixed-feature-b .feature-name').textContent = question.featureB.name;
    document.querySelector('#mixed-feature-b .feature-description').textContent = question.featureB.description;

    const featureOptions = document.querySelectorAll('#comparison-question-content .feature-option');
    featureOptions.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
        option.onclick = () => selectMixedAnswer(option.id === 'mixed-feature-a' ? 'a' : 'b');
    });
}

// Handle mixed answer selection
function selectMixedAnswer(selectedAnswer) {
    const question = gameQuestions[currentQuestionIndex];
    const correctAnswer = question.correctAnswer;

    // Disable further selections
    if (question.type === 'baseline') {
        const options = document.querySelectorAll('#baseline-options .option');
        options.forEach(option => option.onclick = null);

        const selectedOption = document.querySelector(`#baseline-options .option[data-answer="${selectedAnswer}"]`);
        selectedOption.classList.add('selected');

        const isCorrect = selectedAnswer === correctAnswer;
        if (isCorrect) {
            selectedOption.classList.add('correct');
            score++;
            stats[correctAnswer].correct++;
        } else {
            selectedOption.classList.add('incorrect');
            const correctOption = document.querySelector(`#baseline-options .option[data-answer="${correctAnswer}"]`);
            correctOption.classList.add('correct');
        }
    } else if (question.type === 'comparison') {
        const featureOptions = document.querySelectorAll('#comparison-question-content .feature-option');
        featureOptions.forEach(option => option.onclick = null);

        const selectedOption = document.getElementById(`mixed-feature-${selectedAnswer}`);
        selectedOption.classList.add('selected');

        const isCorrect = selectedAnswer === correctAnswer;
        if (isCorrect) {
            selectedOption.classList.add('correct');
            score++;
        } else {
            selectedOption.classList.add('incorrect');
            const correctOption = document.getElementById(`mixed-feature-${correctAnswer}`);
            correctOption.classList.add('correct');
        }
    }

    const isCorrect = selectedAnswer === correctAnswer;

    answers.push({
        question: question,
        selected: selectedAnswer,
        correct: correctAnswer,
        isCorrect: isCorrect
    });

    showMixedFeedback(question, isCorrect, selectedAnswer, correctAnswer);
    document.getElementById('mixed-next-btn').classList.add('show');
}

// Show feedback for mixed game
function showMixedFeedback(question, isCorrect, selectedAnswer, correctAnswer) {
    const feedback = document.getElementById('mixed-feedback');
    const feedbackTitle = document.getElementById('mixed-feedback-title');
    const feedbackText = document.getElementById('mixed-feedback-text');

    if (question.type === 'baseline') {
        // Create MDN search link
        const mdnSearchUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(question.feature.name)}`;
        const mdnLink = `<br><small><a href="${mdnSearchUrl}" target="_blank" rel="noopener noreferrer">Learn more on MDN →</a></small>`;

        if (isCorrect) {
            feedback.className = 'feedback show correct';
            feedbackTitle.textContent = '✅ Correct!';
            feedbackText.innerHTML = `You correctly identified that <strong>${escapeHtml(question.feature.name)}</strong> has <strong>${escapeHtml(getStatusLabel(correctAnswer))}</strong> status.${mdnLink}`;
        } else {
            feedback.className = 'feedback show incorrect';
            feedbackTitle.textContent = '❌ Incorrect';
            feedbackText.innerHTML = `<strong>${escapeHtml(question.feature.name)}</strong> actually has <strong>${escapeHtml(getStatusLabel(correctAnswer))}</strong> status, not ${escapeHtml(getStatusLabel(selectedAnswer))}.`;

            if (question.feature.supportInfo) {
                feedbackText.innerHTML += `<br><small><strong>Browser support:</strong> ${escapeHtml(question.feature.supportInfo)}</small>`;
            }

            feedbackText.innerHTML += mdnLink;
        }
    } else if (question.type === 'comparison') {
        const correctFeature = correctAnswer === 'a' ? question.featureA : question.featureB;
        const incorrectFeature = correctAnswer === 'a' ? question.featureB : question.featureA;

        const correctVersion = getChromeVersion(correctFeature);
        const incorrectVersion = getChromeVersion(incorrectFeature);

        // Create MDN search links for both features
        const mdnSearchUrlA = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(question.featureA.name)}`;
        const mdnSearchUrlB = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(question.featureB.name)}`;
        const mdnLinks = `<br><small>Learn more: <a href="${mdnSearchUrlA}" target="_blank" rel="noopener noreferrer">${escapeHtml(question.featureA.name)} →</a> | <a href="${mdnSearchUrlB}" target="_blank" rel="noopener noreferrer">${escapeHtml(question.featureB.name)} →</a></small>`;

        if (isCorrect) {
            feedback.className = 'feedback show correct';
            feedbackTitle.textContent = '✅ Correct!';
            feedbackText.innerHTML = `<strong>${escapeHtml(correctFeature.name)}</strong> is indeed newer! It was supported from Chrome ${correctVersion}, while <strong>${escapeHtml(incorrectFeature.name)}</strong> was supported from Chrome ${incorrectVersion}.${mdnLinks}`;
        } else {
            feedback.className = 'feedback show incorrect';
            feedbackTitle.textContent = '❌ Incorrect';
            feedbackText.innerHTML = `<strong>${escapeHtml(correctFeature.name)}</strong> is actually newer! It was supported from Chrome ${correctVersion}, while <strong>${escapeHtml(incorrectFeature.name)}</strong> was supported from Chrome ${incorrectVersion}.${mdnLinks}`;
        }
    }
}

// Move to next mixed question
function nextMixedQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < gameQuestions.length) {
        loadMixedQuestion();
    } else {
        showMixedResults();
    }
}

// Show mixed game results
function showMixedResults() {
    document.getElementById('mixed-question-area').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    const accuracy = Math.round((score / gameQuestions.length) * 100);

    document.getElementById('final-score').textContent = `${score}/${gameQuestions.length}`;
    document.getElementById('accuracy').textContent = `${accuracy}%`;

    // Generate answers summary
    const summaryDiv = document.getElementById('answers-summary');
    let summaryHTML = '<div style="margin-bottom: 20px; padding: 15px; background: #f0f8ff; border-radius: 10px; border-left: 4px solid #16a34a;">';
    summaryHTML += '<p style="margin: 0;">Learn more about Baseline at <a href="https://web.dev/baseline" target="_blank" rel="noopener noreferrer" style="color: #16a34a; font-weight: bold;">web.dev/baseline →</a></p>';
    summaryHTML += '</div>';
    summaryHTML += '<h3 style="color: #16a34a; margin-bottom: 20px;">Your Answers:</h3>';

    answers.forEach((answer, index) => {
        const icon = answer.isCorrect ? '✅' : '❌';
        const question = answer.question;

        if (question.type === 'baseline') {
            const mdnSearchUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(question.feature.name)}`;

            summaryHTML += `
                <div style="background: ${answer.isCorrect ? '#f0fff4' : '#fdf2f2'};
                            border: 2px solid ${answer.isCorrect ? '#38a169' : '#e53e3e'};
                            border-radius: 10px;
                            padding: 15px;
                            margin-bottom: 15px;">
                    <div>
                        <strong>${icon} Question ${index + 1}: ${escapeHtml(question.feature.name)}</strong>
                        <p style="margin: 8px 0; color: #666; font-size: 0.9em;">${escapeHtml(question.feature.description)}</p>
                        <p style="margin: 8px 0; font-size: 0.9em;">
                            <strong>Correct answer:</strong> ${escapeHtml(getStatusLabel(answer.correct))}
                            ${!answer.isCorrect ? `<br><strong>Your answer:</strong> ${escapeHtml(getStatusLabel(answer.selected))}` : ''}
                        </p>
                    </div>
                    <a href="${mdnSearchUrl}" target="_blank" rel="noopener noreferrer"
                       style="display: inline-block; margin-top: 10px; color: #16a34a; text-decoration: none; font-size: 0.9em;">
                        📚 Learn more on MDN →
                    </a>
                </div>
            `;
        } else if (question.type === 'comparison') {
            const correctFeature = answer.correct === 'a' ? question.featureA : question.featureB;
            const incorrectFeature = answer.correct === 'a' ? question.featureB : question.featureA;
            const correctVersion = getChromeVersion(correctFeature);
            const incorrectVersion = getChromeVersion(incorrectFeature);

            const mdnSearchUrlA = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(question.featureA.name)}`;
            const mdnSearchUrlB = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(question.featureB.name)}`;

            summaryHTML += `
                <div style="background: ${answer.isCorrect ? '#f0fff4' : '#fdf2f2'};
                            border: 2px solid ${answer.isCorrect ? '#38a169' : '#e53e3e'};
                            border-radius: 10px;
                            padding: 15px;
                            margin-bottom: 15px;">
                    <div>
                        <strong>${icon} Question ${index + 1}: Which feature is newer?</strong>
                        <p style="margin: 8px 0; font-size: 0.9em;">
                            <strong>${escapeHtml(question.featureA.name)}</strong> vs <strong>${escapeHtml(question.featureB.name)}</strong>
                        </p>
                        <p style="margin: 8px 0; font-size: 0.9em;">
                            <strong>Correct answer:</strong> ${escapeHtml(correctFeature.name)} (Chrome ${correctVersion})
                            ${!answer.isCorrect ? `<br><strong>Your answer:</strong> ${escapeHtml(incorrectFeature.name)} (Chrome ${incorrectVersion})` : ''}
                        </p>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.9em;">
                        📚 Learn more:
                        <a href="${mdnSearchUrlA}" target="_blank" rel="noopener noreferrer" style="color: #16a34a; text-decoration: none; margin-left: 5px;">
                            ${escapeHtml(question.featureA.name)} →
                        </a>
                        |
                        <a href="${mdnSearchUrlB}" target="_blank" rel="noopener noreferrer" style="color: #16a34a; text-decoration: none; margin-left: 5px;">
                            ${escapeHtml(question.featureB.name)} →
                        </a>
                    </div>
                </div>
            `;
        }
    });

    summaryDiv.innerHTML = summaryHTML;
}

// Finish quiz early
function finishQuizEarly() {
    if (confirm('Are you sure you want to finish the quiz early? Your current score will be calculated based on answered questions.')) {
        showMixedResults();
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    loadGameData();
});