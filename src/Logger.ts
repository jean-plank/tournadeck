import 'server-cli-only'

import pino from 'pino'

type Logger = pino.Logger
type GetLogger = ReturnType<typeof Logger>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Logger(level: pino.LevelWithSilent) {
  const pino_ = pino({
    level,
    ...(process.env.NODE_ENV !== 'production'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
        }
      : {}),
  })

  return (name: string): Logger => pino_.child({ name })
}

export { Logger, type GetLogger }
