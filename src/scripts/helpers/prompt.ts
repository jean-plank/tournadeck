import readline from 'readline'

export function prompt(label: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise<string>(resolve => {
    rl.question(label, answer => resolve(answer))
  }).finally(() => {
    rl.close()
  })
}
