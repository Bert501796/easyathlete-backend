const { exec } = require("child_process");
const path = require("path");

function runMLOnActivity(stravaId) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../../easyathlete-ml/ml_service.py");

    exec(`python "${scriptPath}" ${stravaId}`, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ ML error:", stderr);
        return reject(stderr);
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (err) {
        reject("Failed to parse ML output: " + err.message);
      }
    });
  });
}
//
module.exports = { runMLOnActivity };
