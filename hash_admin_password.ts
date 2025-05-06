import * as bcrypt from 'bcrypt';

async function hashPassword(password: string) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
}

// Replace 'admin123' with the desired password
hashPassword('admin123');

