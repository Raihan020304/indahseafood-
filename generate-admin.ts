import { hashPassword } from "./src/lib/auth/password";

async function main() {
  console.log(await hashPassword("admin123"));
}

main();