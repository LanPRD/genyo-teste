import { execSync } from "node:child_process";

// Sobe o MongoDB de teste antes da suíte e o remove no fim, mesmo se algum
// teste falhar. Os dados somem junto, porque o container usa tmpfs.
export function setup(): void {
  execSync("npm run db:test:up", { stdio: "pipe", windowsHide: true });
}

export function teardown(): void {
  execSync("npm run db:test:down", { stdio: "pipe", windowsHide: true });
}
