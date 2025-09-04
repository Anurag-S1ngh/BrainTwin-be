import { spawn } from "child_process";

function startBun() {
  const bunProcess = spawn("bun", ["index.ts"], { stdio: "inherit" });

  bunProcess.on("exit", (code) => {
    console.log(`Bun exited with code ${code}. Restarting...`);
    setTimeout(startBun, 1000);
  });
}

startBun();
