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
    if (!feature.supportInfo) return 999;

    const chromeMatch = feature.supportInfo.match(/chrome:\s*(\d+)/);
    if (chromeMatch) {
        return parseInt(chromeMatch[1]);
    }
    return 999;
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

    if (isCorrect) {
        feedback.className = 'feedback show correct';
        feedbackTitle.textContent = '✅ Correct!';
        feedbackText.innerHTML = `You correctly identified that <strong>${escapeHtml(question.name)}</strong> has <strong>${escapeHtml(getStatusLabel(correctAnswer))}</strong> status.`;
    } else {
        feedback.className = 'feedback show incorrect';
        feedbackTitle.textContent = '❌ Incorrect';
        feedbackText.innerHTML = `<strong>${escapeHtml(question.name)}</strong> actually has <strong>${escapeHtml(getStatusLabel(correctAnswer))}</strong> status, not ${escapeHtml(getStatusLabel(selectedAnswer))}.`;

        // Add support info if available
        if (question.supportInfo) {
            feedbackText.innerHTML += `<br><small><strong>Browser support:</strong> ${escapeHtml(question.supportInfo)}</small>`;
        }
    }
}

// Get human-readable status label
function getStatusLabel(status) {
    switch (status) {
        case 'high': return 'Baseline 2024+ (High)';
        case 'low': return 'Baseline 2024 (Low)';
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

    // Show category-specific results
    document.getElementById('high-correct').textContent = `${stats.high.correct}/${stats.high.total}`;
    document.getElementById('low-correct').textContent = `${stats.low.correct}/${stats.low.total}`;
    document.getElementById('unknown-correct').textContent = `${stats.unknown.correct}/${stats.unknown.total}`;
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

        if (versionA !== versionB) {
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
    document.getElementById('mixed-progress-bar').style.width = `${progress}%`;

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
    document.getElementById('mixed-question-title').textContent = 'Which web feature was released more recently?';
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
        if (isCorrect) {
            feedback.className = 'feedback show correct';
            feedbackTitle.textContent = '✅ Correct!';
            feedbackText.innerHTML = `You correctly identified that <strong>${escapeHtml(question.feature.name)}</strong> has <strong>${escapeHtml(getStatusLabel(correctAnswer))}</strong> status.`;
        } else {
            feedback.className = 'feedback show incorrect';
            feedbackTitle.textContent = '❌ Incorrect';
            feedbackText.innerHTML = `<strong>${escapeHtml(question.feature.name)}</strong> actually has <strong>${escapeHtml(getStatusLabel(correctAnswer))}</strong> status, not ${escapeHtml(getStatusLabel(selectedAnswer))}.`;

            if (question.feature.supportInfo) {
                feedbackText.innerHTML += `<br><small><strong>Browser support:</strong> ${escapeHtml(question.feature.supportInfo)}</small>`;
            }
        }
    } else if (question.type === 'comparison') {
        const correctFeature = correctAnswer === 'a' ? question.featureA : question.featureB;
        const incorrectFeature = correctAnswer === 'a' ? question.featureB : question.featureA;

        const correctVersion = getChromeVersion(correctFeature);
        const incorrectVersion = getChromeVersion(incorrectFeature);

        if (isCorrect) {
            feedback.className = 'feedback show correct';
            feedbackTitle.textContent = '✅ Correct!';
            feedbackText.innerHTML = `<strong>${escapeHtml(correctFeature.name)}</strong> is indeed newer! It was supported from Chrome ${correctVersion}, while <strong>${escapeHtml(incorrectFeature.name)}</strong> was supported from Chrome ${incorrectVersion}.`;
        } else {
            feedback.className = 'feedback show incorrect';
            feedbackTitle.textContent = '❌ Incorrect';
            feedbackText.innerHTML = `<strong>${escapeHtml(correctFeature.name)}</strong> is actually newer! It was supported from Chrome ${correctVersion}, while <strong>${escapeHtml(incorrectFeature.name)}</strong> was supported from Chrome ${incorrectVersion}.`;
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

    // Show category-specific results for baseline questions
    document.getElementById('high-correct').textContent = `${stats.high.correct}/${stats.high.total}`;
    document.getElementById('low-correct').textContent = `${stats.low.correct}/${stats.low.total}`;
    document.getElementById('unknown-correct').textContent = `${stats.unknown.correct}/${stats.unknown.total}`;
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    loadGameData();
});