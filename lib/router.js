'use strict'

const OPTIONS = 'OPTIONS'

const PATH_PARAM_REGEX = /{(\w+)(\+)?}/g

const getEndpoint = (endpoints, req) => endpoints
  .filter(e => {
    const httpMethod = e.http.method.toUpperCase()
    const isMethodMatch = httpMethod === req.method || httpMethod === 'ANY'
    const isCors = e.http.cors && req.method === OPTIONS

    return isMethodMatch || isCors
  })
  .find(e => {
    let hasParamMatched = false

    let pathRegex = e.http.path.replace(
      PATH_PARAM_REGEX,
      (match, name, greedy) => {
        hasParamMatched = true
        return `(.+)${greedy ? '$' : ''}`
      }
    )

    if (!hasParamMatched) {
      pathRegex = `^${pathRegex}$` // We expect an exact match for the url
    }

    const reqUrl = req.url.split('?')[0]
    return new RegExp(pathRegex).test(reqUrl)
  })

const toExpressPath = (path) => path
    .replace(PATH_PARAM_REGEX, (match, name, greedy) =>
      `:${name}${greedy ? '(*)' : ''}`
    )

module.exports = {
  getEndpoint,
  toExpressPath,
}
