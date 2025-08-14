import { createInterface } from "readline";
import { stdin, stdout } from "process";

let rl: ReturnType<typeof createInterface> | null = null;

export default async function readInput(): Promise<string | null> {
  return new Promise((resolve) => {
    // Create readline interface if it doesn't exist
    rl ??= createInterface({
      input: stdin,
      output: stdout,
      terminal: true
    });

    // Handle the line input
    const onLine = (line: string) => {
      cleanup();
      resolve(line);
    };

    // Handle EOF (Ctrl-D)
    const onClose = () => {
      cleanup();
      resolve(null);
    };

    const cleanup = () => {
      rl?.removeListener('line', onLine);
      rl?.removeListener('close', onClose);
    };

    rl.on('line', onLine);
    rl.on('close', onClose);
  });
}

// Function to close the readline interface when the program exits
export function closeInput() {
  if (rl) {
    rl.close();
    rl = null;
  }
}