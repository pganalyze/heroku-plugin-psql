import {Command, flags} from '@heroku-cli/command'
import color from '@heroku-cli/color'
import * as Heroku from '@heroku-cli/schema'
import psql, {findMatchingKeyValuePair} from '../util'

export default class AppCommand extends Command {
  static description = 'Like heroku pg:psql but for any Postgres database'

  static examples = [
    `$ heroku psql -a sushi
    DATABASE=> `,
  ]

  static args = [{name: 'database', required: false}]

  static flags = {
    remote: flags.remote(),
    app: flags.app({required: true}),
    command: flags.string({description: 'like --command (-c) in psql, runs single command and exits'}),
    file: flags.string({description: 'like --file (-f) in psql, runs commands from a file and exits'}),
  }

  async run() {
    const {args, flags} = this.parse(AppCommand)
    const response = await this.heroku.get<Heroku.ConfigVars>(`/apps/${flags.app}/config-vars`)
    const config = response.body
    const target = args.database || 'DATABASE_URL'

    // In order of preference, looking for
    const match = findMatchingKeyValuePair(target, config)
    if (!match) {
      this.error('no database found')
    }
    const [matchedKey, url] = match
    if (!url.startsWith('postgres://')) {
      this.error('config var does not appear to be a postgres URL')
    }

    this.log(`--> Connecting to ${color.addon(matchedKey)}`)
    try {
      if (flags.command) {
        process.stdout.write(await psql.exec(url, flags.command))
      } else if (flags.file) {
        process.stdout.write(await psql.execFile(url, flags.file))
      } else {
        const name = matchedKey.replace(/_URL$/, '')
        await psql.interactive(url, name)
      }
    } catch (error) {
      this.error(error)
    }
  }
}
