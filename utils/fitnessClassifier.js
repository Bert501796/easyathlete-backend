// utils/fitnessClassifier.js

function classifyFitnessLevel(metrics, answers) {
  const { weeklyVolume, sessionsPerWeek, longestRun } = metrics;
  const { experience, trainingFrequency } = answers;

  let stravaLevel;
  if (weeklyVolume > 40 && sessionsPerWeek >= 4 && longestRun > 15) {
    stravaLevel = 'Advanced';
  } else if (weeklyVolume > 20 && sessionsPerWeek >= 3) {
    stravaLevel = 'Intermediate';
  } else {
    stravaLevel = 'Beginner';
  }

  let onboardingLevel;
  if (experience === 'Advanced' || trainingFrequency >= 5) {
    onboardingLevel = 'Advanced';
  } else if (experience === 'Intermediate' || trainingFrequency >= 3) {
    onboardingLevel = 'Intermediate';
  } else {
    onboardingLevel = 'Beginner';
  }

  // Combine both assessments
  if (stravaLevel === onboardingLevel) {
    return stravaLevel;
  } else {
    // If there's a discrepancy, choose the lower level to be conservative
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    return levels[Math.min(levels.indexOf(stravaLevel), levels.indexOf(onboardingLevel))];
  }
}

module.exports = { classifyFitnessLevel };
